import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PokemonCardSkeleton(){
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-10"/>
                        <Skeleton className="h-5 w-28" />

                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-5 w-14 rounded-full"/>
                            <Skeleton className="h-5 w-14 rounded-full"/>
                            
                        </div>
                    </div>
                    <Skeleton className="h-20 w-20 rounded-md"/>
                </div>
            </CardContent>
        </Card>
    );
}