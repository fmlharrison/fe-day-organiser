export function eventPath(slug: string, page?: string): string {
  return page ? `/events/${slug}/${page}` : `/events/${slug}`;
}
