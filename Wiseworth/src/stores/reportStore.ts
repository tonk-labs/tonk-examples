/**
 * @fileoverview Store for managing investment reports
 * 
 * This store handles the state management for investment reports, including:
 * - Creating and managing report metadata
 * - Storing links and information for each report
 * - Synchronizing report data across clients
 */

import { create } from 'zustand';
import { sync } from '@tonk/keepsync';

/**
 * Investment link with source URL and optional notes
 */
export interface InvestmentLink {
  /** Unique identifier for the link */
  id: string;
  /** URL of the investment information source */
  url: string;
  /** Title or description of the link */
  title: string;
  /** Optional notes about this link's information */
  notes?: string;
  /** Timestamp when this link was added */
  addedAt: number;
}

/**
 * Investment report containing analysis about a stock or investment
 */
export interface InvestmentReport {
  /** Unique identifier for the report */
  id: string;
  /** Stock symbol or investment identifier */
  symbol: string;
  /** Name of the investment */
  name: string;
  /** User-provided description of this investment report */
  description: string;
  /** Array of related links with information about the investment */
  links: InvestmentLink[];
  /** Creation timestamp */
  createdAt: number;
  /** Last updated timestamp */
  updatedAt: number;
}

/**
 * State interface for the investment reports
 */
interface ReportState {
  /** Map of all investment reports keyed by ID */
  reports: Record<string, InvestmentReport>;
  /** Currently selected report ID */
  selectedReportId: string | null;
  /** UI-specific state */
  ui: {
    /** Whether a new report is being created */
    isCreatingReport: boolean;
    /** Whether report data is being loaded */
    isLoading: boolean;
  };
}

/**
 * Actions interface for manipulating report data
 */
interface ReportActions {
  /** Creates a new investment report */
  createReport: (report: Omit<InvestmentReport, 'id' | 'links' | 'createdAt' | 'updatedAt'>) => string;
  /** Updates an existing report's metadata */
  updateReport: (id: string, updates: Partial<Omit<InvestmentReport, 'id' | 'links' | 'createdAt' | 'updatedAt'>>) => void;
  /** Removes a report */
  deleteReport: (id: string) => void;
  /** Adds a link to a report */
  addLink: (reportId: string, link: Omit<InvestmentLink, 'id' | 'addedAt'>) => string;
  /** Updates a link in a report */
  updateLink: (reportId: string, linkId: string, updates: Partial<Omit<InvestmentLink, 'id' | 'addedAt'>>) => void;
  /** Removes a link from a report */
  deleteLink: (reportId: string, linkId: string) => void;
  /** Selects a report as the current focus */
  selectReport: (id: string | null) => void;
  /** UI action to start creating a new report */
  startCreatingReport: () => void;
  /** UI action to cancel report creation */
  cancelCreatingReport: () => void;
}

/**
 * Combined type for the report store
 */
type ReportStore = ReportState & ReportActions;

/**
 * Creates a synchronized store for investment reports
 * This store is automatically synced across clients
 */
export const useReportStore = create<ReportStore>(
  sync(
    // Store implementation
    (set, get) => ({
      // Initial state
      reports: {},
      selectedReportId: null,
      ui: {
        isCreatingReport: false,
        isLoading: false,
      },

      // Report actions
      createReport: (reportData) => {
        const id = `report-${Date.now()}`;
        const now = Date.now();
        
        set((state) => ({
          reports: {
            ...state.reports,
            [id]: {
              ...reportData,
              id,
              links: [],
              createdAt: now,
              updatedAt: now,
            },
          },
          ui: {
            ...state.ui,
            isCreatingReport: false,
          },
        }));

        return id;
      },

      updateReport: (id, updates) => {
        set((state) => {
          const report = state.reports[id];
          if (!report) return state;

          return {
            reports: {
              ...state.reports,
              [id]: {
                ...report,
                ...updates,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      deleteReport: (id) => {
        set((state) => {
          const { [id]: _, ...remainingReports } = state.reports;
          
          return {
            reports: remainingReports,
            // Clear selection if deleting the selected report
            selectedReportId: state.selectedReportId === id ? null : state.selectedReportId,
          };
        });
      },

      // Link actions
      addLink: (reportId, linkData) => {
        const linkId = `link-${Date.now()}`;
        
        set((state) => {
          const report = state.reports[reportId];
          if (!report) return state;

          return {
            reports: {
              ...state.reports,
              [reportId]: {
                ...report,
                links: [
                  ...report.links,
                  {
                    ...linkData,
                    id: linkId,
                    addedAt: Date.now(),
                  },
                ],
                updatedAt: Date.now(),
              },
            },
          };
        });

        return linkId;
      },

      updateLink: (reportId, linkId, updates) => {
        set((state) => {
          const report = state.reports[reportId];
          if (!report) return state;

          return {
            reports: {
              ...state.reports,
              [reportId]: {
                ...report,
                links: report.links.map(link => 
                  link.id === linkId 
                    ? { ...link, ...updates } 
                    : link
                ),
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      deleteLink: (reportId, linkId) => {
        set((state) => {
          const report = state.reports[reportId];
          if (!report) return state;

          return {
            reports: {
              ...state.reports,
              [reportId]: {
                ...report,
                links: report.links.filter(link => link.id !== linkId),
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      // Selection actions
      selectReport: (id) => {
        set({ selectedReportId: id });
      },

      // UI actions
      startCreatingReport: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            isCreatingReport: true,
          },
        }));
      },

      cancelCreatingReport: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            isCreatingReport: false,
          },
        }));
      },
    }),
    // Sync configuration
    { 
      docId: 'wiseworth-reports',
      onInitError: (error) => console.error('Report sync initialization error:', error)
    }
  )
);