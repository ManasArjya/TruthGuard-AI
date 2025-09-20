'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Upload, Link, Type, X } from 'lucide-react'
import { useSession } from '@supabase/auth-helpers-react'

type InputMode = 'text' | 'url' | 'file'

export default function SearchBar() {
  const [mode, setMode] = useState<InputMode>('text')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const session = useSession()

  // --- THIS IS THE CORRECTED SUBMISSION HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    // 1. Prevent the page from reloading
    e.preventDefault();

    // 2. Check if the user is logged in
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // 3. Prevent submitting an empty form
    if (!content.trim() && !file) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 4. Build the FormData object from your component's state
      const formData = new FormData();
      // For file mode, the content is just a placeholder (like the filename), 
      // but we can add a specific note if we want.
      const claimContent = mode === 'file' && file ? `File submission: ${file.name}` : content;
      formData.append('content', claimContent);
      formData.append('content_type', mode === 'file' ? (file?.type.startsWith('image/') ? 'image' : 'video') : mode);
      
      if (mode === 'url') {
        formData.append('original_url', content);
      }
      
      if (file) {
        formData.append('file', file);
      }

      // 5. Send the request to the backend with the auth token
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/claims/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit claim');
      }

      // 6. Get the new claim's ID from the response and redirect
      const result = await response.json();
      router.push(`/claims/${result.id}`);

    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setContent(selectedFile.name) // Use filename as content placeholder
    }
  }

  const clearFile = () => {
    setFile(null)
    setContent('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Mode Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {setMode('text'); clearFile()}}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'text' 
                ? 'bg-primary-600 text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4 mr-2" />
            Text
          </button>
          <button
            type="button"
            onClick={() => {setMode('url'); clearFile()}}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'url' 
                ? 'bg-primary-600 text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-4 h-4 mr-2" />
            URL
          </button>
          <button
            type="button"
            onClick={() => {setMode('file'); setContent('')}}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'file' 
                ? 'bg-primary-600 text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            File
          </button>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row rounded-xl border-2 border-slate-200 bg-white shadow-lg focus-within:border-primary-500 transition-colors">
          {mode === 'file' ? (
            <div className="flex-1 p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full min-h-[60px] border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors"
              >
                {file ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <span className="font-medium text-slate-900">{file.name}</span>
                      <span className="text-slate-500 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {e.preventDefault(); clearFile()}}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      Click to upload image or video
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Max 50MB • JPG, PNG, GIF, MP4, AVI
                    </p>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                mode === 'text' 
                  ? 'Enter a claim to fact-check...' 
                  : 'Enter a URL to analyze...'
              }
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-transparent border-0 focus:outline-none placeholder-slate-400"
              disabled={isSubmitting}
            />
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !file)}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-b-xl sm:rounded-b-none sm:rounded-r-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Search className="w-5 h-5 mr-2" />
                Fact-Check
              </div>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-3 text-center">
          <p className="text-sm text-slate-500">
            {mode === 'text' && "Paste any claim or statement you want to verify"}
            {mode === 'url' && "Submit news articles, social media posts, or any web content"}
            {mode === 'file' && "Upload images with text or videos with spoken content"}
          </p>
        </div>
      </form>
    </div>
  )
}