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
  GoCheck as SelectFileCheckboxIcon,
  GoDatabase as DatabaseIcon,
  GoPackage as IngestPackageIcon,
  GoThreeBars as BurgerIcon
} from "react-icons/go";

import {
  FaFileImage as ImageFallbackIcon,
  FaFileVideo as VideoFallbackIcon,
  FaFileAudio as AudioFallbackIcon,
  FaFile as GenericFallbackIcon,
  FaHourglass as HourglassIcon,
  FaArchive as ArchiveIcon,
  FaSpinner as SpinnerIcon,
  FaCheck as CheckIcon,
  FaQuestion as QuestionMarkIcon
} from "react-icons/fa";

import "./icons.css";

const LoadingSpinner = () => <SpinnerIcon className="spinning-ckw" />;

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
  LoadingSpinner,
  CheckIcon,
  QuestionMarkIcon,
  BurgerIcon
};
