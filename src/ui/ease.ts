export function easeVars(
  el: HTMLElement | SVGElement,
  [nameX, nameY]: [string, string],
  speed: number,
  from: readonly [number, number] = [0, 0],
) {
  let target = from;
  let now = from;
  let frame = 0;
  const step = () => {
    now = [now[0] + (target[0] - now[0]) * speed, now[1] + (target[1] - now[1]) * speed];
    el.style.setProperty(nameX, now[0].toFixed(3));
    el.style.setProperty(nameY, now[1].toFixed(3));
    frame = Math.abs(target[0] - now[0]) + Math.abs(target[1] - now[1]) > 0.002 ? requestAnimationFrame(step) : 0;
  };
  return {
    aim(x: number, y: number) {
      target = [x, y];
      if (!frame) frame = requestAnimationFrame(step);
    },
    stop: () => cancelAnimationFrame(frame),
  };
}
