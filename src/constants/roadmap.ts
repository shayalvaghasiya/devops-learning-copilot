export interface Concept {
  id: string;
  title: string;
  description: string;
  category: 'fundamentals' | 'docker' | 'kubernetes' | 'cicd' | 'observability';
  dependencies: string[];
}

export const DEVOPS_ROADMAP: Concept[] = [
  {
    id: 'intro-virtualization',
    title: 'Intro to Virtualization',
    description: 'Understanding types of virtualization and the history leading to containers.',
    category: 'fundamentals',
    dependencies: []
  },
  {
    id: 'containers-vs-vms',
    title: 'Containers vs VMs',
    description: 'The core differences in architecture, performance, and use cases.',
    category: 'fundamentals',
    dependencies: ['intro-virtualization']
  },
  {
    id: 'docker-basics',
    title: 'Docker Basics',
    description: 'Images, Containers, and Registry overview.',
    category: 'docker',
    dependencies: ['containers-vs-vms']
  },
  {
    id: 'dockerfile',
    title: 'Dockerfile deep dive',
    description: 'Layers, caching, and building efficient images.',
    category: 'docker',
    dependencies: ['docker-basics']
  },
  {
    id: 'k8s-basics',
    title: 'Kubernetes Foundations',
    description: 'The control plane, nodes, and why orchestration is needed.',
    category: 'kubernetes',
    dependencies: ['docker-basics']
  },
  {
    id: 'k8s-pods',
    title: 'Pods & Services',
    description: 'Networking and atomicity in K8s.',
    category: 'kubernetes',
    dependencies: ['k8s-basics']
  },
  {
    id: 'cicd-intro',
    title: 'CI/CD Concepts',
    description: 'Continuous Integration vs Continuous Delivery/Deployment.',
    category: 'cicd',
    dependencies: ['docker-basics']
  }
];

/**
 * Recursively resolves all direct and indirect dependencies for a given concept ID.
 */
export function getAllDependencies(conceptId: string): string[] {
  const deps = new Set<string>();
  
  function resolver(id: string) {
    const concept = DEVOPS_ROADMAP.find(c => c.id === id);
    if (!concept) return;
    
    concept.dependencies.forEach(depId => {
      if (!deps.has(depId)) {
        deps.add(depId);
        resolver(depId);
      }
    });
  }
  
  resolver(conceptId);
  return Array.from(deps);
}

/**
 * Returns a nested tree structure for a given concept ID.
 */
export function getDependencyTree(conceptId: string): any {
  const concept = DEVOPS_ROADMAP.find(c => c.id === conceptId);
  if (!concept) return null;

  return {
    id: concept.id,
    name: concept.title,
    children: concept.dependencies.map(depId => getDependencyTree(depId)).filter(Boolean)
  };
}
