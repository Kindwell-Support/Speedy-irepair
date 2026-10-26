import type { TeamMember } from "@/lib/sanity/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { PlaceholderMark } from "@/components/ui/PlaceholderMark";
import { LineIcon } from "@/components/ui/LineIcon";

/** Design about.html `.member`: 4:5 photo (or neutral silhouette), name / role / bio body. */
export function MemberCard({ member }: { member: TeamMember }) {
  return (
    <li className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <div className="relative grid aspect-[4/5] place-items-center bg-[radial-gradient(60%_60%_at_50%_40%,#1e1e1e,#121212)] text-text-tertiary">
        {member.photo ? (
          <SmartImage
            image={member.photo}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <LineIcon name="user" size={64} />
        )}
      </div>
      <div className="grid gap-2 px-6 pb-6 pt-4">
        <h3 className="text-h5">
          <PlaceholderMark show={member.isPlaceholder}>{member.name}</PlaceholderMark>
        </h3>
        {member.role ? <p className="text-caption text-text-tertiary">{member.role}</p> : null}
        {member.bio ? <p className="text-body-sm text-text-secondary">{member.bio}</p> : null}
      </div>
    </li>
  );
}
