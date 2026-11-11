import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from '@/components/ui/Slider';

describe('Slider', () => {
  it('mueve la pista de inmediato y limita React a una actualización por frame', () => {
    let ejecutarFrame: FrameRequestCallback | undefined;
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      ejecutarFrame = callback;
      return 1;
    });
    const cancelar = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const onChange = vi.fn();

    render(<Slider aria-label="Prueba" min={0} max={100} step={1} value={0} onChange={onChange} />);
    const slider = screen.getByRole('slider', { name: 'Prueba' });

    fireEvent.input(slider, { target: { value: '25' } });
    fireEvent.input(slider, { target: { value: '60' } });

    expect(slider.style.getPropertyValue('--pct')).toBe('60%');
    expect(raf).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();

    act(() => ejecutarFrame?.(performance.now()));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(60);

    raf.mockRestore();
    cancelar.mockRestore();
  });
});
