"use client";

import { useState, useRef } from "react";

export function ImageUpload({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium text-foreground">Cover image</span>

      {/* The committed value the form actually submits. */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="mt-2">
          {/* Plain <img> rather than next/image: the URL is user-supplied at
              runtime and may point at any configured host. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Cover preview"
            className="max-h-48 rounded-md border border-border object-cover"
          />
          <div className="mt-2 flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-accent"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-muted-foreground hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-2 w-full rounded-md border border-dashed border-border bg-card px-3 py-6 text-sm text-muted-foreground hover:border-accent disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Choose an image (JPEG, PNG, WebP, AVIF — 4 MB max)"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
