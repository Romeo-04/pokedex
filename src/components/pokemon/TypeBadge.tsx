import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/format";

const TYPE_CLASS : Record <string, string> = {
    fire: "bg-orange-500/15 text-orange-700 border-orange-500/30",
    water: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    grass: "bg-green-500/15 text-green-700 border-green-500/30",
    electric: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
    ice :"bg-cyan-500/15 text-cyan-700 border-cyan-500/30",
    fighting: "bg-red-500/15 text-red-700 border-red-500/30",
    poison: "bg-purple-500/15 text-purple-700 border-purple-500/30",
    ground: "bg-yellow-700/15 text-yellow-900 border-yellow-700/30",
    flying: "bg-sky-500/15 text-sky-700 border-sky-500/30",
    psychic: "bg-pink-500/15 text-pink-700 border-pink-500/30",
    bug: "bg-green-700/15 text-green-900 border-green-700/30",
    rock: "bg-gray-500/15 text-gray-700 border-gray-500/30",
    ghost: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
    dragon: "bg-purple-700/15 text-purple-900 border-purple-700/30",
    dark: "bg-gray-700/15 text-gray-900 border-gray-700/30",
    steel: "bg-gray-500/15 text-gray-700 border-gray-500/30",
    fairy: "bg-pink-700/15 text-pink-900 border-pink-700/30",
    normal: "bg-neutral-500/15 text-neutral-700 border-neutral-500/30",

};

export function TypeBadge ({type} : {type: string}){
    return (
        <Badge variant ="outline"
        className = {`rounded-full px-2 py-0. text-xs ${TYPE_CLASS[type] ?? ""}`} >
            {titleCase(type)}
        </Badge>
    );
}