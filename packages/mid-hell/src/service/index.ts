import { createTrait } from './create-trait'

type TraitConfig = {
  readonly verbose?: boolean
}

type FromConfig = {
  readonly src: readonly string[]
  readonly ingredients: readonly string[]
}

type SaveConfig = {
  readonly dst: string
  readonly name: string
}

type TraitBuilder = {
  from(config: FromConfig): FromBuilder
}

type FromBuilder = {
  save(config: SaveConfig): Promise<void>
}

export const Trait = (config: TraitConfig = {}): TraitBuilder => ({
  from: fromParams => ({
    save: saveConfig =>
      createTrait({
        ...fromParams,
        ...saveConfig,
        ...config
      })
  })
})
