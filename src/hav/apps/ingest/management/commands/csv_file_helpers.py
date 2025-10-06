import re
from collections import namedtuple

date_matcher = re.compile(
    r"^\d{4}(-(0[1-9])|-1[0-2]){0,1}(-0[1-9]|-[1-2][0-9]|-3[01]){0,1}$"
)
maxres_matcher = re.compile(r"^[5-6][0-9]{2}|[1-2][0-9]{3}|3000$")
lat_lon_matcher = re.compile(
    r"[+-]{0,1}(?:(?:[0-9]|[1-8][0-9])(?:\.[0-9]+)*|90), [+-]{0,1}(?:(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:\.[0-9]+)*|180)$"
)

# define list of manndatory CSV columns (wheather or not their data is mandatory
# or not is checked separatedly
mandatory_csv_headers = {
    # Basic mandatory field headers as used in the ingest CSV
    "sourcefile": "SourceFile",
    "targetnode": "TargetNodePath",
    "description_author": "HAV:Description:Author",
    # mandatory Media Description field headers
    "md_origmdate": "HAV:MediaDescription:OriginalMediaDate",
    "md_origmtype": "HAV:MediaDescription:OriginalMediaType",
    "md_creator": "HAV:MediaDescription:MediaCreator",
    "md_role": "HAV:MediaDescription:MediaCreatorRole",
    "md_license": "HAV:MediaDescription:License",
    "md_sig": "HAV:MediaDescription:Signature",
    "md_embargoend": "HAV:MediaDescription:EmbargoEndDate",
    "md_isprivate": "HAV:MediaDescription:IsPrivate",
    "md_rotate": "HAV:MediaDescription:Rotate",
    "md_maxres": "HAV:MediaDescription:MaxResolution",
    # mandatory Content Description field headers
    "cd_title": "HAV:ContentDescription:Title",
    "cd_description": "HAV:ContentDescription:Description",
    "cd_tags": "HAV:ContentDescription:Tags",
    "cd_country": "HAV:ContentDescription:Country",
    "cd_relfile": "HAV:ContentDescription:RelatedFiles",
    "cd_relfilecreator": "HAV:ContentDescription:RelatedFilesCreator",
    "cd_relfilerole": "HAV:ContentDescription:RelatedFilesCreatorRole",
    "cd_relfilelicense": "HAV:ContentDescription:RelatedFilesLicense",
    "cd_gpsdata": "HAV:ContentDescription:GPSData",
}

optional_csv_headers = {
    # optional Media Description field headers
    "md_origsig": "HAV:MediaDescription:OriginalSignature",
    "md_shorthandle": "HAV:MediaDescription:ShortHandleOverride",
    # optional Content Description field headers
    "cd_provincestate": "HAV:ContentDescription:Province-State",
    "cd_municipality": "HAV:ContentDescription:Municipality",
    "cd_city": "HAV:ContentDescription:City",
    "cd_location": "HAV:ContentDescription:Location",
    "cd_locationdetail": "HAV:ContentDescription:LocationDetail",
}

# create unified CSV header dict, mandatory headers take precedence in case they
# are defined in both the mandatory and the optional definitions
csv_headers = optional_csv_headers | mandatory_csv_headers

# set up the definitions we want to check (some) csv data fields against
field_sanity_check_definitions = []
f2check = namedtuple(
    "field_to_check",
    [
        "name",
        "is_mandatory",
        "target_types",
        "target_regex",
        "target_values",
        "description",
    ],
)
field_sanity_check_definitions.append(
    f2check(
        name=csv_headers["md_maxres"],
        is_mandatory=False,
        target_types=[int],
        target_regex=maxres_matcher,
        target_values=[],
        description="Leave empty (=no limit) or a number between 500 and \
3000 (=max pixel count of longest side).",
    )
)
field_sanity_check_definitions.append(
    f2check(
        name=csv_headers["md_rotate"],
        is_mandatory=False,
        target_types=[int],
        target_regex=None,
        target_values=[0, 90, 180, 270],
        description="Leave empty or 0 (=do not rotate); or 90, 180, or 270 \
(degrees of rotation).",
    )
)
field_sanity_check_definitions.append(
    f2check(
        name=csv_headers["md_embargoend"],
        is_mandatory=False,
        target_types=[str],
        target_regex=date_matcher,
        target_values=None,
        description="Leave empty (no embargo) or YYYY-MM-DD (date of \
embargo end).",
    )
)
field_sanity_check_definitions.append(
    f2check(
        name=csv_headers["md_isprivate"],
        is_mandatory=False,
        target_types=[int, str],
        target_regex=None,
        target_values=[0, 1, "TRUE", "FALSE"],
        description="Leave empty|0|FALSE (media is NOT private) or \
1|TRUE (media is marked private).",
    )
)
field_sanity_check_definitions.append(
    f2check(
        name=csv_headers["cd_gpsdata"],
        is_mandatory=False,
        target_types=[str],
        target_regex=lat_lon_matcher,
        target_values=None,
        description="Leave empty or provide GPS data the form of decimal latitude \
and longitude strings separated by ', ' (e.g.: '[+-]23.123, [+-]123.321'). \
The '+' or '-' signs are optional.",
    )
)
