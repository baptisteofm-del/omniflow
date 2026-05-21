'use client'
import { useState } from 'react'
import { Switch } from '@radix-ui/react-switch'
import { Info } from 'lucide-react'

export interface SpoofOptionsType {
  stripMetadata: boolean
  reEncode: boolean
  changeTimestamps: boolean
  cropPixels: number
}

interface SpoofOptionsProps {
  options: SpoofOptionsType
  onChange: (options: SpoofOptionsType) => void
}

export function SpoofOptions({ options, onChange }: SpoofOptionsProps) {
  const [showTooltips, setShowTooltips] = useState(false)

  const toggleOption = (key: keyof SpoofOptionsType, value: boolean | number) => {
    onChange({
      ...options,
      [key]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Options de Spoof</h3>
        <button
          onClick={() => setShowTooltips(!showTooltips)}
          className="text-gray-400 hover:text-gray-300 transition-colors"
          title="Afficher les infos"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Strip Metadata */}
      <div className="flex items-start justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Supprimer les métadonnées
          </label>
          {showTooltips && (
            <p className="text-xs text-gray-500">
              Supprime date de création, appareil, localisation, etc.
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <SwitchComponent
            checked={options.stripMetadata}
            onChange={(checked) =>
              toggleOption('stripMetadata', checked)
            }
          />
        </div>
      </div>

      {/* Re-encode */}
      <div className="flex items-start justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Re-encoder la vidéo
          </label>
          {showTooltips && (
            <p className="text-xs text-gray-500">
              Change le hash du fichier. Plus lent mais plus efficace.
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <SwitchComponent
            checked={options.reEncode}
            onChange={(checked) => toggleOption('reEncode', checked)}
          />
        </div>
      </div>

      {/* Change Timestamps */}
      <div className="flex items-start justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Changer les timestamps
          </label>
          {showTooltips && (
            <p className="text-xs text-gray-500">
              Modifie la date de création du fichier.
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <SwitchComponent
            checked={options.changeTimestamps}
            onChange={(checked) =>
              toggleOption('changeTimestamps', checked)
            }
          />
        </div>
      </div>

      {/* Crop pixels */}
      <div className="p-3 rounded-lg bg-white/5">
        <label className="block text-sm font-medium mb-3">
          Recadrage (pixels)
        </label>
        {showTooltips && (
          <p className="text-xs text-gray-500 mb-3">
            Réduit les bords de quelques pixels pour modifier l'apparence.
          </p>
        )}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={options.cropPixels}
            onChange={(e) =>
              toggleOption('cropPixels', parseInt(e.target.value))
            }
            className="flex-1 accent-purple-500"
          />
          <span className="text-xs font-medium w-12 text-right">
            {options.cropPixels}px
          </span>
        </div>
      </div>

      {/* Info box */}
      <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
        <p className="text-xs text-cyan-300">
          💡 <strong>Conseil:</strong> Activez au moins 2 options pour un spoof efficace.
          Re-encoder + Changer timestamps = Très efficace.
        </p>
      </div>
    </div>
  )
}

function SwitchComponent({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-purple-500' : 'bg-gray-700'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
