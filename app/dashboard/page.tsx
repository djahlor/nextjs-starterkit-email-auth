"use client"

import { useState } from 'react'
import { CategoryToggle } from './_components/template-selection/category-toggle'
import { TemplateGrid } from './_components/template-selection/template-grid'
import { EmailGrid } from './_components/template-selection/email-grid'
import { VariantGrid } from './_components/template-selection/variant-grid'
import { ConfigPanel } from './_components/generation/config-panel'
import { GeneratedContent } from './_components/generation/generated-content'
import { cn } from '@/lib/utils'

export type TemplateCategory = 'flows' | 'campaigns'
export type ViewState = 'selection' | 'generation'

export default function DashboardPage() {
  // Template selection state
  const [category, setCategory] = useState<TemplateCategory>('flows')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  
  // Generation state
  const [viewState, setViewState] = useState<ViewState>('selection')
  const [versions, setVersions] = useState<Array<{
    id: string
    content: string
    timestamp: Date
  }>>([])

  // Reset selections when changing template
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setSelectedEmail(null)
    setSelectedVariant(null)
  }

  // Auto-select first variant when email is selected
  const handleEmailSelect = (emailNumber: number) => {
    setSelectedEmail(emailNumber)
    setSelectedVariant(1) // Auto-select first variant
  }

  const handleGenerate = async () => {
    setViewState('generation')
    setVersions(prev => [{
      id: Date.now().toString(),
      content: "Generated content will appear here...",
      timestamp: new Date()
    }, ...prev])
  }

  return (
    <div className="relative flex h-screen bg-dark-100">
      {/* Main content area */}
      <div className={cn(
        "flex-1 min-w-0", // Add min-w-0 to prevent flex item from overflowing
        selectedVariant && "mr-[400px]" // Use margin instead of padding
      )}>
        <div className="h-full overflow-y-auto scrollbar-hide">
          <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-10 bg-dark-100 pb-4">
              <CategoryToggle 
                selected={category} 
                onSelect={setCategory} 
              />
              <select className="bg-dark-200 text-white/80 border border-white/10 rounded-md px-3 py-1.5 text-sm">
                <option>Brand One</option>
                <option>Brand Two</option>
              </select>
            </div>
            
            {/* Scrollable sections */}
            <div className="space-y-8">
              {/* Template section */}
              <section>
                <h2 className="text-lg font-medium text-white/90 mb-4">Email Flow Templates</h2>
                <div className="relative"> {/* Add relative positioning */}
                  <div className="overflow-x-auto scrollbar-hide -mx-6 px-6"> {/* Negative margin to extend full width */}
                    <TemplateGrid
                      category={category}
                      selected={selectedTemplate}
                      onSelect={handleTemplateSelect}
                    />
                  </div>
                </div>
              </section>

              {/* Email section */}
              {selectedTemplate && (
                <section>
                  <h2 className="text-lg font-medium text-white/90 mb-4">Templates</h2>
                  <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
                      <EmailGrid
                        templateId={selectedTemplate}
                        selected={selectedEmail}
                        onSelect={handleEmailSelect}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Variants section */}
              {selectedEmail && (
                <section>
                  <h2 className="text-lg font-medium text-white/90 mb-4">Variants</h2>
                  <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
                      <VariantGrid
                        templateId={selectedTemplate!}
                        emailNumber={selectedEmail}
                        selected={selectedVariant}
                        onSelect={setSelectedVariant}
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Fixed position */}
      {selectedVariant && (
        <div className="fixed right-0 top-0 w-[400px] h-full border-l border-white/10 bg-dark-200">
          {viewState === 'selection' ? (
            <ConfigPanel onGenerate={handleGenerate} />
          ) : (
            <GeneratedContent 
              selectedBrand="Sample Brand"
              versions={versions}
              onRegenerate={handleGenerate}
              onBack={() => setViewState('selection')}
            />
          )}
        </div>
      )}
    </div>
  )
}
