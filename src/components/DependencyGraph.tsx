import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getDependencyTree } from '../constants/roadmap';

interface DependencyGraphProps {
  conceptId: string;
}

export function DependencyGraph({ conceptId }: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const data = getDependencyTree(conceptId);
    if (!data) return;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = 250;
    const margin = { top: 40, right: 90, bottom: 40, left: 90 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const treeData = d3.hierarchy(data);
    const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    const nodes = treeLayout(treeData);

    // Links
    svg.selectAll('.link')
      .data(nodes.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      )
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    // Nodes
    const node = svg.selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 6)
      .attr('fill', (d: any) => d.data.id === conceptId ? '#d946ef' : '#06b6d4')
      .attr('stroke', '#18181b')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))');

    node.append('text')
      .attr('dy', '.35em')
      .attr('x', (d: any) => d.children ? -12 : 12)
      .attr('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .text((d: any) => d.data.name)
      .attr('fill', '#71717a')
      .attr('font-size', '9px')
      .attr('font-weight', '700')
      .attr('class', 'font-sans uppercase tracking-tight');

  }, [conceptId]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[200px]">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
}
