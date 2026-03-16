"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./MediaLibrary.module.css";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaLibrary({ onSelect, onClose }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("library");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (activeTab === "library") {
      fetchLibrary();
    }
  }, [activeTab]);

  const fetchLibrary = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMedia(data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload to Storage
    // NOTE: User must ensure 'blog-media' bucket exists in Supabase and is public
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("blog-media")
      .upload(filePath, file);

    if (uploadError) {
      alert(`Upload Error: ${uploadError.message}. Make sure 'blog-media' bucket exists in Supabase and is public.`);
      setUploading(false);
      return;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("blog-media")
      .getPublicUrl(filePath);

    // 3. Save to Media Table
    const { data: mediaData, error: mediaError } = await supabase
      .from("media")
      .insert({
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
      })
      .select()
      .single();

    if (!mediaError && mediaData) {
      setSelectedItem(mediaData);
      setActiveTab("library");
      fetchLibrary();
    }
    setUploading(false);
  };

  const handleSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem.url);
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Media Library</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <div 
            className={`${styles.tab} ${activeTab === "upload" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            Upload Files
          </div>
          <div 
            className={`${styles.tab} ${activeTab === "library" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("library")}
          >
            Media Library
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === "upload" ? (
            <div className={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                className={styles.hiddenInput} 
                ref={fileInputRef} 
                accept="image/*"
                onChange={handleFileUpload}
              />
              <div className={styles.uploadIcon}>📁</div>
              <h3>Drop files to upload</h3>
              <p>or click to select files from your computer</p>
              <button className={styles.btnDefault} disabled={uploading}>
                {uploading ? "Uploading..." : "Select Files"}
              </button>
            </div>
          ) : (
            <>
              {loading ? (
                <div className={styles.loading}>Loading library...</div>
              ) : media.length === 0 ? (
                <div className={styles.empty}>No media files found. Upload some first!</div>
              ) : (
                <div className={styles.grid}>
                  {media.map((item) => (
                    <div 
                      key={item.id} 
                      className={`${styles.item} ${selectedItem?.id === item.id ? styles.selectedItem : ""}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <img src={item.url} alt={item.name} />
                      {selectedItem?.id === item.id && <div className={styles.check}>✓</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnDefault} onClick={onClose}>Cancel</button>
          <button 
            className={styles.btnPrimary} 
            disabled={!selectedItem || uploading}
            onClick={handleSelect}
          >
            {activeTab === "upload" && uploading ? "Uploading..." : "Insert Image"}
          </button>
        </div>
      </div>
    </div>
  );
}
