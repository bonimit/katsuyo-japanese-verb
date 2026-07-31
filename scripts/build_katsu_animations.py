from pathlib import Path
from PIL import Image
import math

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "game" / "assets"
SIZE = 520


def load(name):
    image = Image.open(ASSETS / name).convert("RGBA")
    image.thumbnail((455, 455), Image.Resampling.LANCZOS)
    return image


def place(image, scale=1.0, angle=0.0, x=0, y=0):
    width = max(1, round(image.width * scale))
    height = max(1, round(image.height * scale))
    frame_image = image.resize((width, height), Image.Resampling.LANCZOS)
    frame_image = frame_image.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    frame = Image.new("RGBA", (SIZE, SIZE))
    left = (SIZE - frame_image.width) // 2 + x
    top = (SIZE - frame_image.height) // 2 + y
    frame.alpha_composite(frame_image, (left, top))
    return frame


def mix(first, second, amount):
    return Image.blend(first, second, max(0, min(1, amount)))


def save(name, frames, durations):
    frames[0].save(
        ASSETS / name,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        format="WEBP",
        quality=82,
        method=6,
    )


idle = load("katsuyo-mascot.png")
thinking = load("katsu-thinking.png")
hinting = load("katsu-hinting.png")
cheering = load("katsu-cheering.png")


def thinking_animation():
    frames, durations = [], []
    for index in range(4):
        frames.append(place(idle, 1 - index * 0.012, -index * 1.2, y=index * 3))
        durations.append(70)
    start = frames[-1]
    for index in range(1, 6):
        target = place(thinking, 0.96 + index * 0.008, -5 + index, y=7 - index)
        frames.append(mix(start, target, index / 5))
        durations.append(65)
    for index in range(12):
        wave = math.sin(index / 12 * math.tau)
        frames.append(place(thinking, 1 + wave * 0.012, wave * 2.2, y=round(-3 * wave)))
        durations.append(85)
    return frames, durations


def hinting_animation():
    frames, durations = [], []
    for index in range(4):
        frames.append(place(idle, 1 - index * 0.018, index * 1.3, y=index * 4))
        durations.append(60)
    start = frames[-1]
    for index in range(1, 7):
        target = place(hinting, 0.94 + index * 0.01, -7 + index * 1.2, x=-8 + index, y=8 - index * 2)
        frames.append(mix(start, target, index / 6))
        durations.append(58)
    for index in range(14):
        pulse = math.sin(index / 14 * math.tau)
        frames.append(place(hinting, 1 + pulse * 0.018, pulse * 1.5, x=round(3 * pulse), y=round(-5 * abs(pulse))))
        durations.append(78)
    return frames, durations


def cheering_animation():
    frames, durations = [], []
    for index in range(4):
        frames.append(place(idle, 1 + index * 0.025, (-1) ** index * 2, y=index * 7))
        durations.append(55)
    crouch = frames[-1]
    for index in range(1, 7):
        target = place(cheering, 0.93 + index * 0.018, -9 + index * 2.4, y=22 - index * 10)
        frames.append(mix(crouch, target, index / 6))
        durations.append(52)
    for index in range(12):
        progress = index / 11
        arc = -42 * math.sin(progress * math.pi)
        frames.append(place(cheering, 1.04 - progress * 0.035, math.sin(progress * math.tau) * 5, y=round(arc)))
        durations.append(62)
    for index in range(5):
        frames.append(place(cheering, 1 - index * 0.008, (-1) ** index * (4 - index), y=round(index * 1.5)))
        durations.append(75)
    return frames, durations


save("katsu-thinking-animated.webp", *thinking_animation())
save("katsu-hinting-animated.webp", *hinting_animation())
save("katsu-cheering-animated.webp", *cheering_animation())
