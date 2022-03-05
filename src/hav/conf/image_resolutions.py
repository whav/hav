import warnings

# https://support.squarespace.com/hc/en-us/articles/206542517-Formatting-your-images-for-display-on-the-web#toc-what-happens-after-i-upload-an-image-
widths = [100, 300, 500, 750, 1000, 1500, 2500]

# Download resolutions not part of the image resolutions specified above will be ignored
download_resolutions = {750: "small", 1500: "medium", 2500: "large"}

resolutions = [{"height": None, "width": width} for width in widths]

if [_ for _ in download_resolutions.keys() if _ not in widths]:
    warnings.warn(
        """
WARNING: some configured download resolutions are not part of the image resolutions \
provided and will not show up in the frontend
"""
    )
