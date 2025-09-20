
// frontend/components/RTIRequestPanel.tsx
'use client'

import { useState } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import { FileText, Send, Download } from 'lucide-react'

interface RTIRequestPanelProps {
  claimId: string
  claimContent: string
}

export default function RTIRequestPanel({ claimId, claimContent }: RTIRequestPanelProps) {
  const [showGenerator, setShowGenerator] = useState(false)
  const [generatedRequest, setGeneratedRequest] = useState('')
  const [authority, setAuthority] = useState('')
  const [generating, setGenerating] = useState(false)
  const session = useSession()

  const generateRTIRequest = async () => {
    setGenerating(true)
    try {
      // Simulate RTI generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockRequest = `Subject: Request for Information under Right to Information Act, 2005

Dear Sir/Madam,

Under the Right to Information Act, 2005, I request the following information regarding the claim: "${claimContent.substring(0, 100)}..."

1. Any official statements, reports, or documents related to this matter
2. Data, statistics, or research that supports or contradicts this claim
3. Policy documents or guidelines relevant to this topic
4. Communication records with relevant stakeholders

I am willing to pay the prescribed fee for obtaining this information.

Thank you for your cooperation.

Yours faithfully,
[Your Name]
[Your Address]
[Contact Information]`

      setGeneratedRequest(mockRequest)
    } catch (error) {
      console.error('Error generating RTI:', error)
    } finally {
      setGenerating(false)
    }
  }

  const submitRTI = async () => {
    if (!session || !authority || !generatedRequest) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rti/requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            claim_id: claimId,
            authority_name: authority,
            request_content: generatedRequest
          })
        }
      )

      if (response.ok) {
        alert('RTI request saved to your dashboard!')
        setShowGenerator(false)
      }
    } catch (error) {
      console.error('Error submitting RTI:', error)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <FileText className="w-5 h-5 mr-2 text-primary-600" />
        <h3 className="font-semibold">Request Official Verification</h3>
      </div>
      
      <p className="text-sm text-slate-600 mb-4">
        Generate an automated RTI (Right to Information) request to seek official 
        verification from relevant government authorities.
      </p>

      {!showGenerator ? (
        <button
          onClick={() => setShowGenerator(true)}
          className="btn-primary w-full"
          disabled={!session}
        >
          Generate RTI Request
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Target Authority
            </label>
            <input
              type="text"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              placeholder="e.g., Ministry of Health, Election Commission"
              className="input w-full"
            />
          </div>

          {!generatedRequest ? (
            <button
              onClick={generateRTIRequest}
              disabled={generating || !authority}
              className="btn-primary w-full"
            >
              {generating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Generating...
                </div>
              ) : (
                'Generate Request'
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Generated RTI Request
                </label>
                <textarea
                  value={generatedRequest}
                  onChange={(e) => setGeneratedRequest(e.target.value)}
                  className="textarea w-full h-32 text-sm"
                />
              </div>

              <div className="flex space-x-2">
                <button onClick={submitRTI} className="btn-success flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Save Request
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(generatedRequest)}
                  className="btn-secondary px-3"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowGenerator(false)}
            className="text-sm text-slate-500 hover:text-slate-700 w-full"
          >
            Cancel
          </button>
        </div>
      )}

      {!session && (
        <p className="text-xs text-slate-500 mt-2">
          Sign in to generate RTI requests
        </p>
      )}
    </div>
  )
}