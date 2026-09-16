# Signed Random Networks: Speaker Script

Network Science | Semester 9 | 2027

Planned duration: 18:00. Three speakers, six minutes each. Timings include demonstration pauses and are a rehearsal target, not automatic slide advancement.

## 1. Signed Random Networks

Speaker 1: Model the relationships | 00:40

Start with the network, not with an equation. Each point is an actor and each connection is a relationship. Ask the room: if all these lines look the same, what important information might be missing? Reveal the two signs. A positive link could mean trust; a negative link could mean distrust. The positions are schematic and do not represent measured social distance.

Our question is whether patterns of agreement and opposition could arise by chance. We will first generate a random signed network, then define balance, and finally compare random expectations with structured examples and published evidence. There are three speakers, with six minutes each. The visual experiments are included in that timing.

Takeaway: Can order emerge from randomly assigned signs?

Sources: [Li & Wang - The energy of random signed graph](https://arxiv.org/html/1812.11865v1); [Easley & Kleinberg - Networks, Crowds, and Markets](https://www.cs.cornell.edu/home/kleinber/networks-book/)

## 2. A missing edge is not a negative edge.

Speaker 1: Model the relationships | 01:00

Use three actors to make the distinction concrete. A and B trust one another, B and C distrust one another, and A and C have no recorded relationship. There are two edges, not three. An absent observation is not evidence of a hostile relationship. Positive and negative are labels chosen for a particular application; they are not moral judgments about the actors.

Other examples include support and opposition in voting, or positive and negative association in data. Those meanings should not be mixed without justification. Today our mathematical examples are simple, unweighted, undirected graphs with no self-loops. Real trust data can be directed: A trusting B need not mean B trusts A. We return to that limitation at the end.

Takeaway: Signs belong to relationships, not to people.

Sources: [Li & Wang - The energy of random signed graph](https://arxiv.org/html/1812.11865v1); [Stanford SNAP - Signed Epinions network](https://snap.stanford.edu/data/soc-sign-epinions.html)

## 3. One network. Two ways to read it.

Speaker 1: Model the relationships | 01:10

Point to a positive connection and then to the corresponding matrix cells. In an undirected graph Aij equals Aji. Diagonal cells are zero because we do not allow self-loops. Click a cell to highlight that relationship in the diagram. The matrix is not a new network: it is another representation of exactly the same edges.

For a node, positive degree counts incident positive edges and negative degree counts incident negative edges. Their sum is its ordinary degree. In contrast, summing the signed entries gives positive degree minus negative degree. A person with three positive and three negative ties has degree six, even though the signed sum is zero. This distinction matters whenever a signed network is passed into an algorithm designed for unsigned graphs.

Takeaway: Count positive and negative degrees separately.

Sources: [Li & Wang - The energy of random signed graph](https://arxiv.org/html/1812.11865v1)

## 4. Two coin flips create an edge.

Speaker 1: Model the relationships | 01:40

Our notation uses n for the number of nodes, p for edge presence, and q for the probability of a positive sign conditional on presence. Each distinct pair is sampled independently. The probability of a positive edge is therefore p times q. A negative edge has probability p times one minus q, and an absent edge has probability one minus p. These three probabilities add to one.

Use the density slider first. More connections appear, but the sign preference has not changed. Now keep density fixed and change q. This changes polarity rather than the underlying connectivity. A fixed seed lets us compare these effects reproducibly. A new seed produces another realization of the same model.

Some papers instead name the positive and negative edge probabilities directly. Their parameters are pq and p times one minus q in our notation. This is a signed extension of the independent-edge Erdos-Renyi model, not a claim that social relationships are actually independent.

Takeaway: Density p and positive-sign probability q are different controls.

Sources: [Li & Wang - The energy of random signed graph](https://arxiv.org/html/1812.11865v1)

## 5. An expectation is not a promise.

Speaker 1: Model the relationships | 01:30

For n nodes there are n times n minus one, divided by two, unordered pairs. Each contributes an edge with probability p. Adding their expected contributions gives the expected edge count. A node has n minus one possible neighbors, so its expected degree is n minus one times p. Positive and negative expected degrees multiply this by q and one minus q respectively.

For ten nodes and density 0.4, there are forty-five possible pairs and eighteen expected edges. At q equal to 0.8, the expected positive count is 14.4. That fractional count is perfectly meaningful as an average even though no individual graph has a fraction of an edge. Re-sample a few times and compare the displayed counts.

The ordinary degree follows a binomial distribution with n minus one trials and probability p. We have a model of the relationships. Speaker two will now ask what patterns of signs count as balanced.

Takeaway: Re-sample: the counts fluctuate while the expectation stays fixed.

Sources: [Li & Wang - The energy of random signed graph](https://arxiv.org/html/1812.11865v1)

## 6. Three people. Four sign patterns.

Speaker 2: Find the balance | 01:20

Begin by reminding the room that these are complete triangles: all three edges exist. There are eight assignments to three labeled edges, but only four types when we group them by how many negative edges they contain. Three positive edges form one type. Two positive edges and one negative form another. One positive edge and two negative edges form the third. Three negatives form the fourth.

In the strong structural-balance definition, all-positive triangles and triangles with two negative edges are balanced. The intuition for the second is a positive pair sharing an opponent. A triangle with two positives and a negative puts one actor between two actors who oppose each other. An all-negative triangle is also unbalanced under this definition. Ask the audience to predict the classification before revealing the labels.

Takeaway: Under strong balance, an even number of negative signs is balanced.

Sources: [Easley & Kleinberg - Networks, Crowds, and Markets](https://www.cs.cornell.edu/home/kleinber/networks-book/); [Leskovec, Huttenlocher & Kleinberg - Signed Networks in Social Media](https://arxiv.org/html/1003.2424v1)

## 7. Multiply the signs. Read the result.

Speaker 2: Find the balance | 00:55

Convert the four cases into a single rule. Represent positive edges as plus one and negative edges as minus one. Multiply the three signs. An even number of negative factors produces plus one; an odd number produces minus one. That is why zero or two negative edges are balanced.

Work through the visible example aloud, then toggle an edge and ask for the new product. The operation is multiplication, not addition. Also, this rule describes a closed triangle; if an edge is missing, there is no triangle to classify. A single edge can belong to many triangles, so the same sign change may reverse several balance classifications at once. We will explore that shared-edge effect in the final section.

Takeaway: One edge flip reverses the balance of every triangle containing it.

Sources: [Easley & Kleinberg - Networks, Crowds, and Markets](https://www.cs.cornell.edu/home/kleinber/networks-book/); [Antal, Krapivsky & Redner - Social Balance on Networks](https://arxiv.org/html/physics/0605183v1)

## 8. How much balance happens by chance?

Speaker 2: Find the balance | 01:30

The all-positive case has probability q cubed because the signs are independent. A triangle with two negatives and one positive has probability q times one minus q squared for a particular placement of the positive edge. There are three placements, so multiply by three. These are disjoint cases, so their probabilities add.

At q equal to one half, half of the existing triangles are balanced in expectation. Move q to 0.8. The answer becomes 0.608, or 60.8 percent. Eighty percent positive edges does not mean eighty percent balanced triangles. This is a useful distinction between an edge-level statistic and a pattern-level statistic.

Notice that p does not appear in this conditional probability. Density still controls how many triangles exist: their expected number is n choose three times p cubed. A sparse realization may have none. In that case a measured balanced-triangle fraction is undefined, not one hundred percent.

Takeaway: 80% positive-sign probability predicts 60.8% balanced triangles.

Sources: [Li & Wang - The energy of random signed graph](https://arxiv.org/html/1812.11865v1); [Leskovec, Huttenlocher & Kleinberg - Signed Networks in Social Media](https://arxiv.org/html/1003.2424v1)

## 9. No triangles. Still unbalanced.

Speaker 2: Find the balance | 01:05

Show the square and ask how many triangles it contains. The answer is zero. A test that only looks for unbalanced triangles would find none and might wrongly conclude that this graph is balanced. Follow the whole square instead. Three edges are positive and one is negative, so their product is minus one. The graph fails the global balance condition.

The general definition requires a positive product around every cycle. Triangle checks are sufficient for complete graphs because longer cycles can be decomposed using their chords. They are not sufficient for arbitrary sparse graphs. A tree is another useful comparison: it has no cycles and is balanced for every assignment of signs. This is not evidence that its relationships are all positive; it is a consequence of its topology.

Takeaway: For a general graph, check cycles, not only triangles.

Sources: [Easley & Kleinberg - Networks, Crowds, and Markets](https://www.cs.cornell.edu/home/kleinber/networks-book/)

## 10. Balance has a global shape.

Speaker 2: Find the balance | 01:10

The balance theorem connects a local sign condition around cycles to a global partition. If a graph is strongly balanced, its vertices can be placed in at most two groups with positive edges inside groups and negative edges across. One group may be empty. In a sparse graph, this describes the edges that exist; it does not require all pairs inside a group to be connected.

Watch the nodes move while the signs stay fixed. This animation exposes a mathematical structure; it does not simulate inevitable social evolution. Switch to three groups. The within-group links remain positive and the between-group links negative. Choosing one actor from each group creates an all-negative triangle. That is incompatible with strong balance but allowed by weak balance.

Weak balance permits multiple groups; on general graphs its cycle condition forbids exactly one negative edge. Speaker three will now explain measurement, local changes, and how to challenge these models with evidence.

Takeaway: Weak balance allows more groups and accepts all-negative triangles.

Sources: [Easley & Kleinberg - Networks, Crowds, and Markets](https://www.cs.cornell.edu/home/kleinber/networks-book/); [Leskovec, Huttenlocher & Kleinberg - Signed Networks in Social Media](https://arxiv.org/html/1003.2424v1)

## 11. A local fix can travel.

Speaker 3: Challenge the model | 01:10

This six-node example starts with two balanced groups, then one positive edge is changed to negative. Because the graph is complete, that edge belongs to n minus two triangles: four in this case. All four become unbalanced. Highlight the common edge so the audience can see why this is not four independent problems.

Flip the edge back and all four are repaired. This particular construction has a known one-edge solution. In a general network, a proposed change may repair some triangles but break others. The local triad dynamics studied by Antal and colleagues repairs a selected imbalanced triangle without necessarily considering all its neighbors. Constrained dynamics considers the change in the overall number of imbalanced triangles.

The important lesson is that an update rule is an additional modeling choice. Randomly assigning the starting network and evolving it toward balance are two different processes. We should not present either as a universal law of human behavior.

Takeaway: A local repair does not guarantee global improvement.

Sources: [Antal, Krapivsky & Redner - Social Balance on Networks](https://arxiv.org/html/physics/0605183v1)

## 12. How far away is balance?

Speaker 3: Challenge the model | 01:05

A balanced-or-unbalanced label is sometimes too coarse. The frustration index asks how many relationships need to be removed or reversed to obtain balance. Equivalently, consider every two-group assignment. A positive edge across groups or a negative edge within a group is unsatisfied. The smallest possible number of unsatisfied edges is the frustration index.

The displayed formula is just a compact way to count these disagreements. Each term is zero when the edge agrees with the group assignment and one otherwise. Our six-node example has four unbalanced triangles, but the minimum is one edge because all four share the same defect. This shows why triangle counts and frustration are different measures.

Exact minimization is computationally difficult in general. Here we enumerate all assignments for a tiny graph; the implementation caps exact demonstrations at twelve nodes. We do not claim that this method scales to an entire social-media network.

Takeaway: Four unbalanced triangles can share a one-edge solution.

Sources: [Easley & Kleinberg - Networks, Crowds, and Markets](https://www.cs.cornell.edu/home/kleinber/networks-book/)

## 13. Compared with what?

Speaker 3: Challenge the model | 01:30

A high balance score on its own is not enough. We need to ask what would happen under a specified null model. The independent-edge model from the first section randomizes both the existence of edges and their signs. That may be too permissive when the observed topology is important.

Here we use a different null model. Hold the topology fixed and randomly permute the existing edge signs. The exact positive and negative counts are preserved. The example is synthetic: it was constructed to have two balanced groups. Run the comparison to see where that original score sits relative to one hundred shuffled networks.

Shuffling does not preserve each individual node's positive and negative degrees. More constrained signed-degree models may be appropriate for some research questions. Also, triangles share edges, so they are not independent observations. We show an empirical randomization distribution rather than inventing a simple independent-triangle significance calculation. A fixed-count shuffle is not exactly the independent-sign formula on small graphs.

Takeaway: The null model determines what your comparison can tell you.

Sources: [Leskovec, Huttenlocher & Kleinberg - Signed Networks in Social Media](https://arxiv.org/html/1003.2424v1); [Li & Wang - The energy of random signed graph](https://arxiv.org/html/1812.11865v1)

## 14. Real networks are not coin flips.

Speaker 3: Challenge the model | 01:15

Now separate our synthetic experiments from actual evidence. Leskovec, Huttenlocher, and Kleinberg studied signed links from Epinions, Slashdot, and Wikipedia. The chart reproduces rounded Epinions triangle frequencies from Table 3 of their 2010 paper. All-positive triangles accounted for about 87 percent, compared with about 62.1 percent under the reported random baseline. Triangles with two positives and one negative were much less common than the baseline.

However, all-negative triangles were also overrepresented in Epinions, which is not what the strongest version of balance predicts. The authors found the undirected results more compatible with weak balance. When direction and formation order were taken into account, status theory explained several patterns better.

A positive rating may express respect for expertise rather than mutual friendship. Observational patterns do not establish causation. These results motivate signed models while reminding us that the meaning of an edge and the choice of representation determine which theory is appropriate.

Takeaway: Signs, direction, context, and the baseline all matter.

Sources: [Leskovec, Huttenlocher & Kleinberg - Signed Networks in Social Media](https://arxiv.org/html/1003.2424v1); [Stanford SNAP - Signed Epinions network](https://snap.stanford.edu/data/soc-sign-epinions.html)

## 15. The sign is only the beginning.

Speaker 3: Challenge the model | 01:00

Give the room a few seconds to classify the displayed triangle before revealing the answer. It contains two negative edges and one positive edge, so the product is positive and it is strongly balanced. Ask a second quick question: if a network has no triangles, is it necessarily balanced? No: the four-edge cycle was a counterexample.

Close with three ideas. First, absence and opposition are different, and random generation needs separate choices for connectivity and polarity. Second, balance concerns patterns and cycles, not simply the percentage of positive edges. Third, an observed pattern is only unusual relative to a clearly specified random baseline.

The untimed reference drawer contains our sources and additional notes on exact calculations and stronger null models. Leave the network on screen for questions. The complete rehearsed route is eighteen minutes, leaving up to two minutes within a twenty-minute class slot for discussion.

Takeaway: Describe the signs. Test the structure. Question the baseline.

Sources: [Li & Wang - The energy of random signed graph](https://arxiv.org/html/1812.11865v1); [Easley & Kleinberg - Networks, Crowds, and Markets](https://www.cs.cornell.edu/home/kleinber/networks-book/); [Leskovec, Huttenlocher & Kleinberg - Signed Networks in Social Media](https://arxiv.org/html/1003.2424v1)

## Controls

Arrow keys or Page Up / Page Down navigate slides. Home / End jump to the first / last slide. Space plays or pauses the twelve-second explainer. N opens speaker notes; O opens the overview. Escape closes dialogs. The talk timer starts separately and does not advance slides.

Source: app/src/content.ts. This document is generated by the build.