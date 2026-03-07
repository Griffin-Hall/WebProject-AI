import { Badge } from '@/components/ui';

interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="default" className="capitalize">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
