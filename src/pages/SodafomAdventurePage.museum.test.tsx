import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SodafomAdventurePage from './SodafomAdventurePage'

vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }))
vi.mock('@/components/ArchieCharacter', () => ({ default: () => null }))

describe('SodafomAdventurePage Museum Explorer', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('gives the Museum Ask Archie input an accessible name and opens a requested gallery', async () => {
    render(
      <MemoryRouter>
        <SodafomAdventurePage />
      </MemoryRouter>
    )

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Museum Explorer/ }))
    })

    const museumQuestion = screen.getByRole('textbox', {
      name: 'Ask Archie to open a museum',
    })
    expect(museumQuestion).toHaveAttribute('placeholder', 'Try: Viking museum')

    act(() => {
      fireEvent.change(museumQuestion, { target: { value: 'Viking museum' } })
      fireEvent.click(screen.getByRole('button', { name: 'Open requested museum' }))
    })

    expect(screen.getByRole('button', { name: /Longship model/ })).toBeInTheDocument()
  })
})
