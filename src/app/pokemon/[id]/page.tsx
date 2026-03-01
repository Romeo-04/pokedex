import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TypeBadge } from "@/components/pokemon/TypeBadge";
import { StatBars } from "@/components/pokemon/StatBars";
import { pokemonImageUrl, pad3, titleCase } from "@/lib/format";
import { fetchPokemonDetailById } from "@/lib/pokeapi";
import { computeTypeMultipliers, splitMultipliers } from "@/lib/weakness";

export const dynamic = "force-dynamic";

function clampId(n: number) {
  return Number.isFinite(n) && n > 0 ? n : NaN;
}

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = clampId(Number((await params).id));
  if (!id) return notFound();

  let p;
  try {
    p = await fetchPokemonDetailById(id);
  } catch {
    return notFound();
  }

  const typeNames = p.types
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name);

  const mult = await computeTypeMultipliers(typeNames);
  const { weak, resist, immune } = splitMultipliers(mult);

  const prevId = p.id > 1 ? p.id - 1 : null;
  const nextId = p.id + 1; // we’ll keep enabled; later we can clamp by max count

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/">
          <Button variant="secondary">← Back</Button>
        </Link>

        <div className="flex gap-2">
          <Link href={prevId ? `/pokemon/${prevId}` : "#"} aria-disabled={!prevId} tabIndex={!prevId ? -1 : 0}>
            <Button variant="outline" disabled={!prevId}>
              Previous
            </Button>
          </Link>
          <Link href={`/pokemon/${nextId}`}>
            <Button variant="outline">Next</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="relative h-56 w-56 shrink-0 mx-auto md:mx-0">
              <Image
                src={pokemonImageUrl(p.id)}
                alt={`${p.name} image`}
                fill
                sizes="224px"
                className="object-contain"
                priority
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">#{pad3(p.id)}</div>
                <h1 className="text-3xl font-bold">{titleCase(p.name)}</h1>
                <div className="flex flex-wrap gap-2 pt-1">
                  {typeNames.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Height</div>
                  <div className="font-medium">{p.height} dm</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Weight</div>
                  <div className="font-medium">{p.weight} hg</div>
                </div>
                <div className="rounded-md border p-3 sm:col-span-2">
                  <div className="text-xs text-muted-foreground">Abilities</div>
                  <div className="font-medium">
                    {p.abilities.map((a) => titleCase(a.ability.name)).join(", ")}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Base Stats</h2>
                <StatBars stats={p.stats} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weakness / Resist / Immune */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Type Matchups</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Weaknesses</div>
              {weak.length ? (
                <div className="flex flex-wrap gap-2">
                  {weak.map(([t, m]) => (
                    <span key={t} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                      <TypeBadge type={t} />
                      <span className="text-muted-foreground">{m}×</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">None</div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Resistances</div>
              {resist.length ? (
                <div className="flex flex-wrap gap-2">
                  {resist.map(([t, m]) => (
                    <span key={t} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                      <TypeBadge type={t} />
                      <span className="text-muted-foreground">{m}×</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">None</div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Immunities</div>
              {immune.length ? (
                <div className="flex flex-wrap gap-2">
                  {immune.map(([t]) => (
                    <span key={t} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                      <TypeBadge type={t} />
                      <span className="text-muted-foreground">0×</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">None</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}