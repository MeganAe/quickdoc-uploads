import React from "react";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";

export type FileFormatType =
  | "pdf"
  | "word"
  | "excel"
  | "powerpoint"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "code"
  | "other";

export function getFileFormatType(format?: string, title?: string): FileFormatType {
  const ext = (format || title?.split(".").pop() || "").toLowerCase();

  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "odt", "rtf"].includes(ext)) return "word";
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return "excel";
  if (["ppt", "pptx", "odp"].includes(ext)) return "powerpoint";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "heic"].includes(ext)) return "image";
  if (["mp4", "mov", "webm", "avi", "mkv", "wmv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac", "m4a", "aac"].includes(ext)) return "audio";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (["js", "ts", "tsx", "jsx", "html", "css", "py", "json", "xml", "sql", "sh"].includes(ext))
    return "code";

  return "other";
}

interface MaterialFileIconProps {
  format?: string;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function MaterialFileIcon({
  format,
  title,
  size = "md",
  className = "",
}: MaterialFileIconProps) {
  const type = getFileFormatType(format, title);

  const sizeStyles = {
    sm: "size-8 rounded-lg text-xs",
    md: "size-11 rounded-xl text-sm",
    lg: "size-14 rounded-2xl text-base",
    xl: "size-16 rounded-2xl text-lg",
  };

  const iconSizes = {
    sm: "size-4",
    md: "size-5",
    lg: "size-7",
    xl: "size-8",
  };

  // Material Design color themes & icons for each file type
  switch (type) {
    case "pdf":
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-sm shadow-red-500/20 ${sizeStyles[size]} ${className}`}
        >
          <FileText className={iconSizes[size]} />
        </div>
      );

    case "word":
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm shadow-blue-500/20 ${sizeStyles[size]} ${className}`}
        >
          <FileText className={iconSizes[size]} />
        </div>
      );

    case "excel":
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-sm shadow-emerald-500/20 ${sizeStyles[size]} ${className}`}
        >
          <FileSpreadsheet className={iconSizes[size]} />
        </div>
      );

    case "powerpoint":
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/20 ${sizeStyles[size]} ${className}`}
        >
          <FileText className={iconSizes[size]} />
        </div>
      );

    case "image":
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-sm shadow-purple-500/20 ${sizeStyles[size]} ${className}`}
        >
          <FileImage className={iconSizes[size]} />
        </div>
      );

    case "video":
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-sm shadow-amber-500/20 ${sizeStyles[size]} ${className}`}
        >
          <FileVideo className={iconSizes[size]} />
        </div>
      );

    case "audio":
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/20 ${sizeStyles[size]} ${className}`}
        >
          <FileAudio className={iconSizes[size]} />
        </div>
      );

    case "archive":
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-sm shadow-cyan-500/20 ${sizeStyles[size]} ${className}`}
        >
          <FileArchive className={iconSizes[size]} />
        </div>
      );

    case "code":
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-slate-700 to-slate-900 text-emerald-400 shadow-sm shadow-slate-500/20 ${sizeStyles[size]} ${className}`}
        >
          <FileCode className={iconSizes[size]} />
        </div>
      );

    default:
      return (
        <div
          className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-sm shadow-slate-400/20 ${sizeStyles[size]} ${className}`}
        >
          <File className={iconSizes[size]} />
        </div>
      );
  }
}

interface MaterialFolderIconProps {
  category: string;
  isOpen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MaterialFolderIcon({
  category,
  isOpen = false,
  size = "md",
  className = "",
}: MaterialFolderIconProps) {
  const FIcon = isOpen ? FolderOpen : Folder;

  const sizeMap = {
    sm: "size-10 rounded-xl",
    md: "size-12 rounded-2xl",
    lg: "size-16 rounded-3xl",
  };

  const iconSizeMap = {
    sm: "size-5",
    md: "size-6",
    lg: "size-8",
  };

  const gradients: Record<string, { bg: string; shadow: string; color: string }> = {
    Cours: {
      bg: "bg-gradient-to-br from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
      color: "text-white",
    },
    "Relevés de notes": {
      bg: "bg-gradient-to-br from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/25",
      color: "text-white",
    },
    Projets: {
      bg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      shadow: "shadow-blue-500/25",
      color: "text-white",
    },
    Administratif: {
      bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
      color: "text-white",
    },
    Autre: {
      bg: "bg-gradient-to-br from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/25",
      color: "text-white",
    },
  };

  const current = gradients[category] || {
    bg: "bg-gradient-to-br from-primary to-indigo-600",
    shadow: "shadow-primary/25",
    color: "text-white",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${current.bg} ${current.color} shadow-lg ${current.shadow} transition-transform group-hover:scale-105 ${sizeMap[size]} ${className}`}
    >
      <FIcon className={iconSizeMap[size]} />
    </div>
  );
}
