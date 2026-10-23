import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useDebouncedValue } from "./UseDebounce"

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("only publishes the last value once typing stops", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "Par" },
    })
    expect(result.current).toBe("Par")

    rerender({ value: "Pari" })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: "Paris" })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe("Par")

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe("Paris")
  })
})
