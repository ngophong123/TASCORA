import * as React from "react"

export interface WordmarkProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

/**
 * 1. NEXUS LABS: Geometric hexagon with central connector + technical sans wordmark
 */
export function NexusLabsWordmark({ className = "h-7 w-auto", ...props }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 156 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Nexus Labs"
      {...props}
    >
      {/* Hexagonal Node Glyph */}
      <path
        d="M14 4L24 9.77V21.32L14 27.1L4 21.32V9.77L14 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="15.5" r="3.2" fill="currentColor" />
      <circle cx="14" cy="4" r="1.6" fill="currentColor" />
      <circle cx="24" cy="21.3" r="1.6" fill="currentColor" />
      <circle cx="4" cy="21.3" r="1.6" fill="currentColor" />
      {/* Typography */}
      <text
        x="34"
        y="21"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="15"
        fontWeight="800"
        letterSpacing="0.12em"
      >
        NEXUS
      </text>
      <rect x="108" y="10" width="38" height="13" rx="3.5" fill="currentColor" fillOpacity="0.15" />
      <text
        x="114"
        y="20"
        fontFamily="ui-monospace, monospace"
        fontSize="9"
        fontWeight="700"
        letterSpacing="0.08em"
      >
        LABS
      </text>
    </svg>
  )
}

/**
 * 2. STRATOS: Dual orbital planetary rings + ultra-bold neo-grotesque
 */
export function StratosWordmark({ className = "h-7 w-auto", ...props }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 148 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Stratos"
      {...props}
    >
      {/* Orbital Ring Glyph */}
      <circle cx="14" cy="16" r="6" fill="currentColor" />
      <ellipse
        cx="14"
        cy="16"
        rx="12"
        ry="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        transform="rotate(-28 14 16)"
      />
      {/* Typography */}
      <text
        x="34"
        y="22"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="17"
        fontWeight="900"
        letterSpacing="-0.04em"
      >
        STRATOS
      </text>
    </svg>
  )
}

/**
 * 3. HYPERION: Layered prism chevrons + modern wide-tracked serif/sans
 */
export function HyperionWordmark({ className = "h-7 w-auto", ...props }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 156 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hyperion"
      {...props}
    >
      {/* Geometric Prism Triangles */}
      <path
        d="M14 4L25 24H3L14 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M14 11L20 22H8L14 11Z" fill="currentColor" />
      {/* Typography */}
      <text
        x="33"
        y="21"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14.5"
        fontWeight="700"
        letterSpacing="0.18em"
      >
        HYPERION
      </text>
    </svg>
  )
}

/**
 * 4. VERTEX AI: Dynamic apex chevron + bold wordmark + AI superscript badge
 */
export function VertexAiWordmark({ className = "h-7 w-auto", ...props }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 150 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Vertex AI"
      {...props}
    >
      {/* Dynamic Chevron Glyph */}
      <path d="M6 7L14 23L22 7H17L14 14.5L11 7H6Z" fill="currentColor" />
      <path d="M14 3L18 9H10L14 3Z" fill="currentColor" />
      {/* Typography */}
      <text
        x="29"
        y="21.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="15.5"
        fontWeight="800"
        letterSpacing="-0.02em"
      >
        VERTEX
      </text>
      {/* AI Superscript Badge */}
      <rect x="114" y="8" width="22" height="14" rx="3" fill="currentColor" fillOpacity="0.15" />
      <text
        x="118"
        y="18.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="9"
        fontWeight="800"
        letterSpacing="0.05em"
      >
        AI
      </text>
    </svg>
  )
}

/**
 * 5. CHRONO CLOUD: Concentric dial rings + clean modern sans
 */
export function ChronoCloudWordmark({ className = "h-7 w-auto", ...props }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 162 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Chrono Cloud"
      {...props}
    >
      {/* Chrono Dial Icon */}
      <circle cx="14" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M14 9V16L18.5 18.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Typography */}
      <text
        x="32"
        y="21"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14.5"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        CHRONO
      </text>
      <text
        x="112"
        y="21"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14.5"
        fontWeight="400"
        letterSpacing="0.05em"
        fillOpacity="0.8"
      >
        CLOUD
      </text>
    </svg>
  )
}

/**
 * 6. AETHER DATA: 4-Point crystal diamond star + expanded uppercase
 */
export function AetherDataWordmark({ className = "h-7 w-auto", ...props }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 160 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Aether Data"
      {...props}
    >
      {/* Diamond Spark Glyph */}
      <path
        d="M14 3L17.5 12.5L27 16L17.5 19.5L14 29L10.5 19.5L1 16L10.5 12.5L14 3Z"
        fill="currentColor"
      />
      {/* Typography */}
      <text
        x="34"
        y="21"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14.5"
        fontWeight="800"
        letterSpacing="0.14em"
      >
        AETHER
      </text>
      <text
        x="118"
        y="21"
        fontFamily="ui-monospace, monospace"
        fontSize="9.5"
        fontWeight="600"
        letterSpacing="0.06em"
        fillOpacity="0.75"
      >
        DATA
      </text>
    </svg>
  )
}

/**
 * 7. SYNAPSE: Interconnected synaptic pulse nodes + tech mono
 */
export function SynapseWordmark({ className = "h-7 w-auto", ...props }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 150 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Synapse"
      {...props}
    >
      {/* Synaptic Node Network */}
      <circle cx="6" cy="16" r="3.2" fill="currentColor" />
      <circle cx="16" cy="7" r="3.2" fill="currentColor" />
      <circle cx="16" cy="25" r="3.2" fill="currentColor" />
      <circle cx="26" cy="16" r="3.2" fill="currentColor" />
      <line x1="6" y1="16" x2="16" y2="7" stroke="currentColor" strokeWidth="1.8" />
      <line x1="6" y1="16" x2="16" y2="25" stroke="currentColor" strokeWidth="1.8" />
      <line x1="16" y1="7" x2="26" y2="16" stroke="currentColor" strokeWidth="1.8" />
      <line x1="16" y1="25" x2="26" y2="16" stroke="currentColor" strokeWidth="1.8" />
      {/* Typography */}
      <text
        x="35"
        y="21.5"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="15"
        fontWeight="700"
        letterSpacing="0.08em"
      >
        SYNAPSE
      </text>
    </svg>
  )
}

/**
 * 8. MONOLITH: Three staggered geometric pillars + architectural bold
 */
export function MonolithWordmark({ className = "h-7 w-auto", ...props }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 154 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Monolith"
      {...props}
    >
      {/* Monolithic Pillars */}
      <rect x="4" y="10" width="4.5" height="16" rx="1.5" fill="currentColor" />
      <rect x="12" y="5" width="4.5" height="21" rx="1.5" fill="currentColor" />
      <rect x="20" y="13" width="4.5" height="13" rx="1.5" fill="currentColor" />
      {/* Typography */}
      <text
        x="33"
        y="21.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="15.5"
        fontWeight="900"
        letterSpacing="0.1em"
      >
        MONOLITH
      </text>
    </svg>
  )
}

export const FICTIONAL_ENTERPRISE_WORDMARKS = [
  { id: "nexus", Component: NexusLabsWordmark, name: "Nexus Labs" },
  { id: "stratos", Component: StratosWordmark, name: "Stratos" },
  { id: "hyperion", Component: HyperionWordmark, name: "Hyperion" },
  { id: "vertex", Component: VertexAiWordmark, name: "Vertex AI" },
  { id: "chrono", Component: ChronoCloudWordmark, name: "Chrono Cloud" },
  { id: "aether", Component: AetherDataWordmark, name: "Aether Data" },
  { id: "synapse", Component: SynapseWordmark, name: "Synapse" },
  { id: "monolith", Component: MonolithWordmark, name: "Monolith" },
]
