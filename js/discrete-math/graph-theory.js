/**
 * Discrete Mathematics Module: Graph Theory
 * Models an Undirected Weighted Graph G = (V, E) of Expense Categories.
 * Vertices V: Set of predefined expense categories.
 * Edges E: Categories spent on the same calendar day (Co-spending relation).
 * Computes Adjacency Matrix, Adjacency List, Vertex Degrees, Handshaking Lemma,
 * Connected Components, and renders an interactive HTML5 Canvas graph.
 */

const GraphTheoryModule = {
    /**
     * Build Graph G = (V, E) from live expenses
     */
    buildCategoryGraph(expenses) {
        const vertices = CATEGORIES.map((c, index) => ({
            index,
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            type: c.type
        }));

        const n = vertices.length;
        const vertexMap = new Map();
        vertices.forEach(v => vertexMap.set(v.id, v.index));

        // Group categories by date
        const dateToCategories = {};
        expenses.forEach(e => {
            if (!dateToCategories[e.date]) {
                dateToCategories[e.date] = new Set();
            }
            dateToCategories[e.date].add(e.category);
        });

        // Initialize Adjacency Matrix: A[n][n]
        // A[i][j] stores the weight (number of days categories i and j were both active)
        const adjMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
        const edgesMap = new Map(); // key "i-j" where i < j

        for (const date in dateToCategories) {
            const catList = Array.from(dateToCategories[date]);
            for (let i = 0; i < catList.length; i++) {
                for (let j = i + 1; j < catList.length; j++) {
                    const u = vertexMap.get(catList[i]);
                    const v = vertexMap.get(catList[j]);
                    if (u !== undefined && v !== undefined && u !== v) {
                        adjMatrix[u][v]++;
                        adjMatrix[v][u]++;

                        const edgeKey = u < v ? `${u}-${v}` : `${v}-${u}`;
                        if (!edgesMap.has(edgeKey)) {
                            edgesMap.set(edgeKey, {
                                source: Math.min(u, v),
                                target: Math.max(u, v),
                                sourceName: vertices[Math.min(u, v)].name,
                                targetName: vertices[Math.max(u, v)].name,
                                weight: 1,
                                dates: [date]
                            });
                        } else {
                            const eObj = edgesMap.get(edgeKey);
                            eObj.weight++;
                            eObj.dates.push(date);
                        }
                    }
                }
            }
        }

        const edges = Array.from(edgesMap.values());

        // Build Adjacency List & calculate Vertex Degrees
        const adjList = {};
        const degrees = [];
        let totalDegreeSum = 0;

        vertices.forEach((v, i) => {
            adjList[v.id] = [];
            let deg = 0;
            for (let j = 0; j < n; j++) {
                if (adjMatrix[i][j] > 0) {
                    deg++;
                    adjList[v.id].push({
                        neighborId: vertices[j].id,
                        neighborName: vertices[j].name,
                        cooccurrences: adjMatrix[i][j]
                    });
                }
            }
            degrees.push({
                vertex: v.id,
                name: v.name,
                icon: v.icon,
                color: v.color,
                degree: deg
            });
            totalDegreeSum += deg;
        });

        // Handshaking Lemma Verification:
        // Σ deg(v) = 2 * |E|
        const edgeCount = edges.length;
        const handshakingHolds = totalDegreeSum === (2 * edgeCount);

        // Connected Components via BFS/DFS
        const connectedComponents = this.findConnectedComponents(vertices, adjMatrix);
        const isConnected = connectedComponents.length === 1 && vertices.length > 0;

        return {
            vertices,
            edges,
            adjMatrix,
            adjList,
            degrees,
            metrics: {
                vertexCount: n,
                edgeCount,
                totalDegreeSum,
                handshakingHolds,
                handshakingFormula: `Σ deg(v) = ${totalDegreeSum}  and  2 × |E| = 2 × ${edgeCount} = ${2 * edgeCount}`,
                isConnected,
                componentCount: connectedComponents.length,
                connectedComponents
            }
        };
    },

    // Breadth-First Search (BFS) to find connected components
    findConnectedComponents(vertices, adjMatrix) {
        const n = vertices.length;
        const visited = Array(n).fill(false);
        const components = [];

        for (let i = 0; i < n; i++) {
            if (!visited[i]) {
                const component = [];
                const queue = [i];
                visited[i] = true;

                while (queue.length > 0) {
                    const u = queue.shift();
                    component.push(vertices[u].name);

                    for (let v = 0; v < n; v++) {
                        if (adjMatrix[u][v] > 0 && !visited[v]) {
                            visited[v] = true;
                            queue.push(v);
                        }
                    }
                }
                components.push(component);
            }
        }

        return components;
    },

    /**
     * Interactive Canvas Graph Visualizer
     */
    renderCanvasGraph(canvasId, graphData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.parentElement.clientWidth || 600;
        const height = canvas.height = 420;

        // Positioning nodes in a circle
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 75;

        const n = graphData.vertices.length;
        const nodePositions = graphData.vertices.map((v, i) => {
            const angle = (2 * Math.PI / n) * i - Math.PI / 2;
            return {
                ...v,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                radius: 26
            };
        });

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw Edges
        graphData.edges.forEach(edge => {
            const source = nodePositions[edge.source];
            const target = nodePositions[edge.target];

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.strokeStyle = isDark ? 'rgba(147, 197, 253, 0.45)' : 'rgba(59, 130, 246, 0.4)';
            ctx.lineWidth = Math.min(2 + edge.weight * 1.5, 6);
            ctx.stroke();

            // Draw Edge Weight Badge at midpoint
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;

            ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
            ctx.beginPath();
            ctx.arc(midX, midY, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(edge.weight, midX, midY);
        });

        // Draw Nodes (Vertices)
        nodePositions.forEach(node => {
            // Glow
            ctx.save();
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 10;

            // Circle background
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();
            ctx.restore();

            // Border
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Icon / Emoji
            ctx.font = '16px "Segoe UI Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.icon, node.x, node.y - 2);

            // Label text below node
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.fillText(node.id, node.x, node.y + node.radius + 14);

            // Degree Badge
            const deg = graphData.degrees.find(d => d.vertex === node.id)?.degree || 0;
            ctx.beginPath();
            ctx.arc(node.x + node.radius - 4, node.y - node.radius + 4, 9, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillText(`d:${deg}`, node.x + node.radius - 4, node.y - node.radius + 4);
        });
    }
};

window.GraphTheoryModule = GraphTheoryModule;

