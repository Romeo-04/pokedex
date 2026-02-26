export function pad3(id: number) {
    return String(id).padStart(3,"0");
}

export function pokemonImageUrl(id: number){
    return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pad3(id)}.png`;
}

export function titleCase (s: string){
    return s.length? s[0].toUpperCase() + s.slice(1):s;
}