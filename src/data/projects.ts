export interface Project {
  title: string;
  tagline: string;
  description: string;
  stack: string[];
  github: string;
  live: string | null;
}

export const projects: Project[] = [
  {
    title: 'Gardenia',
    tagline: 'Plataforma de gestión de jardines, de Sisques Labs',
    description:
      'Aplicación para planificar, seguir y cuidar tu jardín. La primera app pública desplegada sobre mi propio clúster de Kubernetes.',
    stack: ['Kubernetes', 'Argo CD'],
    github: 'https://github.com/JSisques/gardenia',
    live: 'https://gardenia.sisqueslabs.com',
  },
  {
    title: 'DaysOff',
    tagline: 'Calculador de puentes vacacionales',
    description:
      'Encuentra la combinación óptima de días de vacaciones para maximizar el tiempo libre consecutivo aprovechando festivos y fines de semana. Sin backend: todo el cálculo corre en el navegador.',
    stack: ['Astro', 'React', 'TypeScript', 'Tailwind'],
    github: 'https://github.com/sisques-labs/daysoff',
    live: 'https://sisques-labs.github.io/daysoff/',
  },
  {
    title: 'Homelab as Code',
    tagline: 'Todo mi homelab, definido y desplegado desde Git',
    description:
      'Infraestructura y servicios de mi homelab (VMs, contenedores, monitorización) gestionados como código: reproducibles, declarativos y desplegados automáticamente con Terraform, Ansible, K3s y Argo CD.',
    stack: ['Proxmox', 'Terraform', 'Ansible', 'K3s', 'Argo CD', 'Prometheus'],
    github: 'https://github.com/JSisques/homelab',
    live: null,
  },
];
