DELETE * FROM directories_graph.directories_content dc
WHERE dc.graph_name Like 'ebenistes';
DELETE * FROM directories_graph.dataset dst
WHERE dst.graph_name Like 'ebenistes';
DELETE * FROM directories_graph.geocoding gcd
WHERE gcd.graph_name Like 'ebenistes';
