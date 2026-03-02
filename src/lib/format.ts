export function pad3(id: number) {
    return String(id).padStart(3,"0");
}

export function pokemonImageUrl(id: number){
    // Official Pokémon artwork only exists for main-series (IDs < 10000)
    if (id >= 10000) return "/pokeball_logo.png";
    return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pad3(id)}.png`;
}

export function titleCase (s: string){
    return s.length? s[0].toUpperCase() + s.slice(1):s;
}