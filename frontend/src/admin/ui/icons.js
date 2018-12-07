import React from "react";

import {
  MdCheckBoxOutlineBlank as CheckboxBlankIcon,
  MdCheckBox as CheckboxCheckedIcon,
  MdAddBox as AddIcon,
  MdViewModule as GalleryIcon,
  MdViewList as ListIcon,
  MdFileUpload as UploadIcon
} from "react-icons/md";

import {
  GoHome as HomeIcon,
  GoFileDirectory as DirectoryIcon,
  GoFileMedia as GenericFallbackIcon,
  GoCheck as SelectFileCheckboxIcon,
  GoDatabase as DatabaseIcon,
  GoPackage as IngestPackageIcon
} from "react-icons/go";

import {
  FaFileImage as ImageFallbackIcon,
  FaFileVideo as VideoFallbackIcon,
  FaFileAudio as AudioFallbackIcon,
  FaHourglass as HourglassIcon,
  FaArchive as ArchiveIcon,
  FaSpinner as SpinnerIcon
} from "react-icons/fa";

const LoadingSpinner = () => <SpinnerIcon className="fa-spin" />;

export {
  CheckboxBlankIcon,
  CheckboxCheckedIcon,
  AddIcon,
  GalleryIcon,
  ListIcon,
  UploadIcon,
  DirectoryIcon,
  GenericFallbackIcon,
  SelectFileCheckboxIcon,
  ImageFallbackIcon,
  VideoFallbackIcon,
  AudioFallbackIcon,
  HourglassIcon,
  HomeIcon,
  ArchiveIcon,
  DatabaseIcon,
  IngestPackageIcon,
  SpinnerIcon,
  LoadingSpinner
};
