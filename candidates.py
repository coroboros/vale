#!/usr/bin/env python3
"""Temporary: downloads small previews of candidate photos per destination, for a human to pick from."""

import json
import re
import sys
import time
import urllib.parse
from pathlib import Path

sys.path.insert(0, "brand")
from photos import API, FREE, get  # noqa: E402

QUERIES = {
    "lisbonne": ["Lisboa esplanada miradouro", "Alfama elétrico 28", "Miradouro de Santa Luzia esplanada", "Lisbon tram Alfama street"],
    "porto": ["Ribeira Porto esplanada", "Cais da Ribeira Porto", "Porto Ribeira restaurants"],
    "algarve": ["Praia da Marinha", "Lagos Algarve old town street", "Benagil Algarve"],
    "madere": ["Funchal Zona Velha", "Funchal esplanada", "Ponta de São Lourenço Madeira"],
    "acores": ["Sete Cidades miradouro", "Ponta Delgada Portas da Cidade", "Lagoa do Fogo"],
    "madrid": ["Plaza Mayor Madrid terraza", "Madrid terraza", "Gran Vía Madrid Metrópolis"],
    "barcelone": ["Plaça Reial Barcelona", "Barcelona terrassa Sagrada Família", "Park Güell Barcelona"],
    "valence": ["Plaza de la Virgen Valencia", "Valencia terraza plaza", "Ciudad de las Artes y las Ciencias"],
    "baleares": ["Caló des Moro", "Palma de Mallorca catedral", "Deià Mallorca"],
    "andalousie": ["Sevilla terraza Giralda", "Barrio de Santa Cruz Sevilla", "Plaza de España Sevilla", "Alhambra Granada mirador San Nicolás"],
    "canaries": ["Roque Cinchado Teide", "San Cristóbal de La Laguna calle", "Puerto de la Cruz Tenerife"],
    "paysbasque": ["Parte Vieja Donostia", "La Concha San Sebastián", "Casco Viejo Bilbao"],
    "galice": ["Praza do Obradoiro Santiago", "Rúa do Franco Santiago de Compostela", "Illas Cíes Rodas"],
    "roma": ["Piazza della Rotonda Pantheon", "Colosseo Roma vista", "Trastevere Roma vicolo", "Piazza Navona Roma"],
    "firenze": ["Piazza della Signoria Firenze", "Duomo Firenze via", "Ponte Vecchio Firenze"],
    "venezia": ["Piazza San Marco caffè", "Venezia canale fondamenta", "Canal Grande gondola"],
    "milano": ["Navigli Milano", "Galleria Vittorio Emanuele II", "Piazza del Duomo Milano"],
    "napoli": ["Positano", "Spaccanapoli Napoli", "Amalfi Duomo piazza"],
    "sicilia": ["Taormina Corso Umberto", "Piazza Duomo Ortigia Siracusa", "Cefalù spiaggia", "Taormina Etna"],
    "londres": ["London pub exterior", "South Bank London Thames", "Westminster Bridge Big Ben", "Covent Garden London"],
    "edimbourg": ["Victoria Street Edinburgh", "Royal Mile Edinburgh", "Edinburgh Castle Princes Street Gardens"],
    "dublin": ["Temple Bar Dublin pub", "Ha'penny Bridge Dublin", "Dublin Grafton Street"],
    "newyork": ["Manhattan sidewalk café", "Brooklyn Bridge Manhattan skyline", "Greenwich Village street", "Central Park Bow Bridge"],
}
PER_QUERY = 5


def search(text: str) -> list[dict]:
    query = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "formatversion": "2",
            "generator": "search",
            "gsrnamespace": "6",
            "gsrlimit": "20",
            "gsrsearch": f"{text} filetype:bitmap filew:>2400",
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata",
            "iiurlwidth": "330",
            "iiextmetadatafilter": "LicenseShortName",
        }
    )
    data = json.loads(get(f"{API}?{query}")).get("query", {})
    found = sorted(data.get("pages", []), key=lambda page: page.get("index", 99))
    kept = []
    for page in found:
        info = page["imageinfo"][0]
        license_name = info["extmetadata"].get("LicenseShortName", {}).get("value", "")
        if FREE.match(license_name) and 1.2 <= info["width"] / info["height"] <= 2.1:
            kept.append({"title": page["title"][5:], "w": info["width"], "h": info["height"], "license": license_name, "thumb": info["thumburl"]})
        if len(kept) == PER_QUERY:
            break
    return kept


def main() -> None:
    current = {key: photo["file"] for key, photo in json.loads(Path("src/ui/photos.json").read_text()).items()}
    root = Path("candidates")
    for place, texts in QUERIES.items():
        folder = root / place
        folder.mkdir(parents=True, exist_ok=True)
        seen: set[str] = set()
        listing = []
        for text in texts:
            for found in search(text):
                if found["title"] in seen:
                    continue
                seen.add(found["title"])
                index = len(listing)
                (folder / f"{index:02d}.jpg").write_bytes(get(found["thumb"]))
                listing.append({"n": index, **{k: v for k, v in found.items() if k != "thumb"}, "query": text, "current": found["title"] == current.get(place)})
                time.sleep(0.3)
        (root / f"{place}.json").write_text(json.dumps(listing, ensure_ascii=False, indent=1) + "\n")
        print(place, len(listing), re.sub(r"\s+", " ", ", ".join(item["title"][:30] for item in listing[:3])))


if __name__ == "__main__":
    main()
