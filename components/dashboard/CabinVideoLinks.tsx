"use client";

import { useState } from "react";
import { Link2, Plus, Trash2, Video } from "lucide-react";
import {
  cabanaFieldClass,
  cabanaSectionClass,
} from "@/components/dashboard/cabana-form-styles";
import { isAllowedSocialVideoUrl } from "@/lib/videoEmbeds";
import type { CabanaVideo } from "@/types/cabin";
import { toast } from "sonner";

type LocalModeProps = {
  mode: "local";
  value: string[];
  onChange: (urls: string[]) => void;
};

type ApiModeProps = {
  mode: "api";
  videos: CabanaVideo[];
  onAdd: (url: string) => Promise<void>;
  onRemove: (videoId: number) => Promise<void>;
  busy?: boolean;
};

type CabinVideoLinksProps = LocalModeProps | ApiModeProps;

export function CabinVideoLinks(props: CabinVideoLinksProps) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const busy = props.mode === "api" ? Boolean(props.busy || saving) : saving;

  const handleAdd = async () => {
    const url = draft.trim();
    if (!url) {
      toast.error("Pegá un enlace de video.");
      return;
    }
    if (!isAllowedSocialVideoUrl(url)) {
      toast.error("Solo links de YouTube, Instagram o Facebook.");
      return;
    }

    if (props.mode === "local") {
      if (props.value.includes(url)) {
        toast.error("Ese link ya está en la lista.");
        return;
      }
      props.onChange([...props.value, url]);
      setDraft("");
      return;
    }

    setSaving(true);
    try {
      await props.onAdd(url);
      setDraft("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${cabanaSectionClass} space-y-4`}>
      <div>
        <h3 className="flex items-center gap-2 font-black text-slate-900">
          <Video size={20} className="text-primary" /> Videos
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Pegá un link de YouTube, Instagram o Facebook. No se suben archivos
          de video.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleAdd();
            }
          }}
          className={cabanaFieldClass}
          placeholder="https://www.youtube.com/watch?v=..."
          disabled={busy}
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={busy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-60"
        >
          <Plus size={14} /> Agregar
        </button>
      </div>

      {props.mode === "local" && props.value.length === 0 && (
        <p className="text-[11px] text-slate-400">
          Si agregás links, se guardan al publicar el alojamiento.
        </p>
      )}

      {props.mode === "local" && props.value.length > 0 && (
        <ul className="space-y-2">
          {props.value.map((url) => (
            <li
              key={url}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
            >
              <Link2 size={14} className="mt-0.5 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                {url}
              </span>
              <button
                type="button"
                onClick={() =>
                  props.onChange(props.value.filter((u) => u !== url))
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Quitar video"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {props.mode === "api" && props.videos.length > 0 && (
        <ul className="space-y-2">
          {props.videos.map((video) => (
            <li
              key={video.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
            >
              <Link2 size={14} className="mt-0.5 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-700">{video.url}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {video.proveedor}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void props.onRemove(video.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
                aria-label="Eliminar video"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
