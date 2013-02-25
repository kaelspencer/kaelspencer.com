// The vertex, or node, of the graph.
var Vertex = (function() {
    function Vertex() {
        this.m_edges = new Array();
    };

    // Add the edge to the list of edges that connect this vertex to otheres.
    Vertex.prototype.addEdge = function(edge) {
        if (!edge instanceof Edge) {
            throw new TypeError('edge is not an instance of Edge in Vertex.addEdge');
        }

        this.m_edges.push(edge);
    };

    // Average the weights of all connecting edges.
    Vertex.prototype.getAverageWeight = function() {
        var average = 0;

        if (this.m_edges.length) {
            $.each(this.m_edges, function() {
                average += this.getWeight();
            });

            average /= this.m_edges.length;
        }

        return average;
    };

    return Vertex;
})();

// The edge, or arc, of the graph. It connects two and only two vertices.
var Edge = (function() {
    function Edge(vertex1, vertex2, weight) {
        if (!vertex1 instanceof Vertex) {
            throw new TypeError('vertex1 is not an instance of Vertex in Edge.constructor');
        } else if (!vertex2 instanceof Vertex) {
            throw new TypeError('vertex1 is not an instance of Vertex in Edge.constructor');
        } else if (weight != null && typeof weight !== "number") {
            throw new TypeError('weight is not a number in Edge.constructor');
        }

        this.m_v1 = vertex1;
        this.m_v2 = vertex2;
        this.m_weight = weight || 0;

        vertex1.addEdge(this);
        vertex2.addEdge(this);
    };

    // getWeight
    Edge.prototype.getWeight = function() {
        return this.m_weight;
    };

    return Edge;
})();

// The graph holds all of the vertices and edges and is responsible for creating them.
var Graph = (function() {
    function Graph() {
        this.m_vertices = new Array();
        this.m_edges = new Array();
    };

    // Create a new vertex, add it to the list, and return it.
    Graph.prototype.addVertex = function() {
        var v = new Vertex();
        this.m_vertices.push(v);
        return v;
    };

    // Add an edge between the two vertices.
    Graph.prototype.connect = function(vertex1, vertex2, weight) {
        var e = new Edge(vertex1, vertex2, weight);
        this.m_edges.push(e);
        return e;
    };

    return Graph;
})();
