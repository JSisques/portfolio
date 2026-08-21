export interface StackItem {
  name: string;
  slug: string;
}

export const stack: StackItem[] = [
  { name: 'Astro', slug: 'astro' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'Node.js', slug: 'nodedotjs' },
  { name: 'Python', slug: 'python' },
  { name: 'NestJS', slug: 'nestjs' },
  { name: 'GraphQL', slug: 'graphql' },
  { name: 'Prisma', slug: 'prisma' },
  { name: 'SQL', slug: 'postgresql' },
  { name: 'React', slug: 'react' },
  { name: 'Next.js', slug: 'nextdotjs' },
  { name: 'Kubernetes', slug: 'kubernetes' },
  { name: 'Terraform', slug: 'terraform' },
  { name: 'Ansible', slug: 'ansible' },
  { name: 'Argo CD', slug: 'argo' },
  { name: 'Proxmox', slug: 'proxmox' },
  { name: 'Docker', slug: 'docker' },
  { name: 'Prometheus', slug: 'prometheus' },
  { name: 'Grafana', slug: 'grafana' },
  { name: 'Traefik', slug: 'traefikproxy' },
];
