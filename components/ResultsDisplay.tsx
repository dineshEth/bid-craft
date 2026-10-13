'use client';

import React, { useState } from 'react';
import { RFPExtractedData, ProposalData } from '@/lib/llm/types';

interface ResultsDisplayProps {
  extractedData: RFPExtractedData | null;
  proposal: ProposalData | null;
  fileMetadata: any | null;
  provider: string | null;
  onReset: () => void;
}

export default function ResultsDisplay({
  extractedData,
  proposal,
  fileMetadata,
  provider,
  onReset,
}: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'extracted' | 'proposal'>('extracted');

  if (!extractedData && !proposal) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Processing Results</h2>
          {fileMetadata && (
            <p className="text-sm text-gray-500 mt-1">
              {fileMetadata.fileName} ({fileMetadata.fileType}) - 
              {fileMetadata.wordCount.toLocaleString()} words
            </p>
          )}
          {provider && (
            <p className="text-sm text-blue-600 mt-1">
              Generated using: {provider}
            </p>
          )}
        </div>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Upload Another
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('extracted')}
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === 'extracted'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Extracted RFP Data
        </button>
        <button
          onClick={() => setActiveTab('proposal')}
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === 'proposal'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Generated Proposal
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {activeTab === 'extracted' && extractedData && (
          <ExtractedDataDisplay data={extractedData} />
        )}
        
        {activeTab === 'proposal' && proposal && (
          <ProposalDisplay data={proposal} />
        )}
      </div>
    </div>
  );
}

function ExtractedDataDisplay({ data }: { data: RFPExtractedData }) {
  return (
    <div className="space-y-6">
      {/* Title */}
      {data.title && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Title</h3>
          <p className="p-4 bg-gray-50 rounded-lg">{data.title}</p>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Executive Summary</h3>
          <p className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{data.summary}</p>
        </div>
      )}

      {/* Requirements */}
      {data.requirements && data.requirements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Requirements</h3>
          <ul className="p-4 bg-gray-50 rounded-lg space-y-2">
            {data.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scope */}
      {data.scope && data.scope.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Scope</h3>
          <ul className="p-4 bg-gray-50 rounded-lg space-y-2">
            {data.scope.map((scope, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>{scope}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline */}
      {data.timeline && (data.timeline.startDate || data.timeline.endDate || data.timeline.duration) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Timeline</h3>
          <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.timeline.startDate && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Start Date</p>
                <p>{data.timeline.startDate}</p>
              </div>
            )}
            {data.timeline.endDate && (
              <div>
                <p className="text-sm text-gray-500 mb-1">End Date</p>
                <p>{data.timeline.endDate}</p>
              </div>
            )}
            {data.timeline.duration && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p>{data.timeline.duration}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budget */}
      {data.budget && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Budget</h3>
          <p className="p-4 bg-gray-50 rounded-lg">{data.budget}</p>
        </div>
      )}

      {/* Stakeholders */}
      {data.stakeholders && data.stakeholders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Stakeholders</h3>
          <div className="p-4 bg-gray-50 rounded-lg flex flex-wrap gap-2">
            {data.stakeholders.map((stakeholder, index) => (
              <span key={index} className="px-3 py-1 bg-white border rounded-full text-sm">
                {stakeholder}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Deliverables */}
      {data.deliverables && data.deliverables.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Expected Deliverables</h3>
          <ul className="p-4 bg-gray-50 rounded-lg space-y-2">
            {data.deliverables.map((deliverable, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>{deliverable}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evaluation Criteria */}
      {data.evaluationCriteria && data.evaluationCriteria.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Evaluation Criteria</h3>
          <ul className="p-4 bg-gray-50 rounded-lg space-y-2">
            {data.evaluationCriteria.map((criterion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Company Info */}
      {data.companyInfo && (data.companyInfo.name || data.companyInfo.industry || data.companyInfo.location) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Company Information</h3>
          <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.companyInfo.name && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p>{data.companyInfo.name}</p>
              </div>
            )}
            {data.companyInfo.industry && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Industry</p>
                <p>{data.companyInfo.industry}</p>
              </div>
            )}
            {data.companyInfo.location && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p>{data.companyInfo.location}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProposalDisplay({ data }: { data: ProposalData }) {
  return (
    <div className="space-y-8">
      {/* Project Title */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Title</h3>
        <p className="p-4 bg-gray-50 rounded-lg text-xl font-bold">{data.projectTitle}</p>
      </div>

      {/* Executive Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Executive Summary</h3>
        <p className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{data.executiveSummary}</p>
      </div>

      {/* Problem Statement */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Problem Statement</h3>
        <p className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{data.problemStatement}</p>
      </div>

      {/* Proposed Solution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Proposed Solution</h3>
        <p className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{data.proposedSolution}</p>
      </div>

      {/* Methodology */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Methodology</h3>
        <p className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{data.methodology}</p>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Timeline</h3>
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p>{data.timeline.startDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">End Date</p>
              <p>{data.timeline.endDate}</p>
            </div>
          </div>
          
          {data.timeline.milestones && data.timeline.milestones.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Milestones</h4>
              <div className="space-y-3">
                {data.timeline.milestones.map((milestone, index) => (
                  <div key={index} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{milestone.phase}</p>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                      <p className="text-sm text-gray-500 whitespace-nowrap">{milestone.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Budget</h3>
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total</p>
              <p className="text-xl font-bold">{data.budget.total}</p>
            </div>
          </div>
          
          {data.budget.breakdown && data.budget.breakdown.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Cost Breakdown</h4>
              <div className="space-y-2">
                {data.budget.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between p-2 bg-white rounded border">
                    <p>{item.item}</p>
                    <p className="font-medium">{item.cost}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team */}
      {data.team && data.team.members && data.team.members.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Team</h3>
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            {data.team.members.map((member, index) => (
              <div key={index} className="p-3 bg-white rounded border flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <p className="font-bold">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{member.experience}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deliverables */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Deliverables</h3>
        <div className="p-4 bg-gray-50 rounded-lg flex flex-wrap gap-2">
          {data.deliverables.map((deliverable, index) => (
            <span key={index} className="px-3 py-1 bg-white border rounded-full text-sm">
              {deliverable}
            </span>
          ))}
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">How We Meet Evaluation Criteria</h3>
        <ul className="p-4 bg-gray-50 rounded-lg space-y-2">
          {data.evaluationCriteria.map((criterion, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Company Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Company Information</h3>
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Company Name</p>
            <p className="font-bold">{data.companyInfo.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">About</p>
            <p className="whitespace-pre-wrap">{data.companyInfo.about}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Experience</p>
            <p className="whitespace-pre-wrap">{data.companyInfo.experience}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Contact</p>
            <p className="whitespace-pre-wrap">{data.companyInfo.contact}</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border-t">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Download as JSON
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Download as PDF
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
