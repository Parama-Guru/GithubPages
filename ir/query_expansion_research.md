# Query Expansion Techniques in Information Retrieval

## Research Record

- Domain: Information Retrieval and Web Search.
- Topic: Query Expansion Techniques in Information Retrieval.
- Topic evidence: the title and first slide of [ir_ppt.html](ir_ppt.html).
- Research date: 2026-09-17.
- Scope: research and presentation planning only; the existing presentation is unchanged.
- Status: completed selected-source research dossier, ready for presentation planning.
- Evidence policy: distinguish source-supported facts, author-reported results, and illustrative examples. A research paper's result is not a guarantee for every search system.
- Coverage: classical feedback and lexical methods, embedding-based expansion, learned sparse representations, generative expansion, evaluation, and selected developments available by the research date.
- Limits: this is a focused literature review, not an exhaustive systematic review. No retrieval benchmark or production search experiment was reproduced.

## Executive Summary

1. The problem is vocabulary mismatch: users and relevant documents often express the same information differently. Expansion is one way to bridge that gap. [S1]
2. The difficult part is choosing and weighting evidence, not merely generating more words. Original-query information should remain an explicit reference point. [S2][S7][S9][S18]
3. PRF, WordNet, and embeddings are appropriate teaching examples, but they are not an exhaustive or mutually exclusive taxonomy. An embedding method can itself use local feedback documents. [S1][S8][S9]
4. No method wins universally. Corpus vocabulary, initial retrieval quality, query intent, retriever architecture, and latency budget all matter. [S3][S9][S13][S18]
5. LLMs add a new source of expansion evidence, but also introduce factual errors, operating cost, and dependence on model and prompt choices. Generated content is not a replacement for retrieved evidence. [S5][S18]
6. The presentation should pair a successful example with a failure example and show how to measure both retrieval coverage and ranking quality. [S3][S10]

## Central Argument

Query expansion adds related terms or richer textual representations to a query to reduce vocabulary mismatch between the user's information need and relevant documents. Useful expansion preserves intent; uncontrolled expansion can retrieve the wrong topic. It should therefore be evaluated against the original-query baseline, not assumed to improve retrieval. [S1][S2][S3]

For the presentation, the central question is:

**Where should expansion terms come from, and how do we prevent those terms from changing the user's intent?**

## Verified Foundations

### Vocabulary Mismatch

The same concept can be expressed using different words. A lexical retrieval system may miss relevant documents when query and document vocabulary differ. Synonymy motivates expansion, but ambiguity means that a related word is not always appropriate in the current context. [S1]

### Global and Local Evidence

- Global expansion uses resources such as thesauri, lexical databases, or collection-wide associations that do not depend on the current first-pass result set. [S1][S2]
- Local expansion uses the documents retrieved for the current query. Relevance feedback and pseudo-relevance feedback belong here. [S1][S3]
- Interactive expansion lets the user select or supply terms; automatic expansion changes the search representation without requiring that interaction. [S2]

These are classification axes, not a claim that there are only three expansion algorithms.

### Pseudo-Relevance Feedback

1. Retrieve an initial ranked list using the original query.
2. Assume that the top selected documents are relevant.
3. Extract and weight useful terms from those documents.
4. Combine those terms with the original query and search again.

The assumption in step 2 is not a relevance judgment from the user. If the initial results concentrate on an unintended topic, feedback can reinforce that topic. Stanford's textbook explicitly documents this query-drift risk. [S3]

### Modern Generative Approaches

- Query2doc generates a pseudo-document using an LLM and uses it to expand the query. The paper investigates both sparse and dense retrieval. [S4]
- HyDE generates a hypothetical document, encodes it, and retrieves real documents by vector similarity. It is a related query-side transformation, not simply a synonym list appended to a lexical query. [S5]
- Jagerman and colleagues investigate different LLM prompting strategies for query expansion on MS MARCO and BEIR. Their findings are specific to the experiments reported in the paper. [S6]

Generated text is a retrieval aid, not verified evidence about the world. In particular, HyDE's generated document may contain hallucinations. [S5]

## Domain and Terminology

Information retrieval concerns finding and ranking documents or passages that satisfy an information need. Web search adds heterogeneous content, very large collections, changing vocabulary, ambiguous intents, and tight interactive response requirements. Query expansion belongs to query processing and retrieval, not to web crawling itself. [S1][S11][S13]

| Concept | What changes | Relationship to this topic |
| --- | --- | --- |
| Query expansion | Adds terms, phrases, or an enriched query representation | The presentation's main subject |
| Query rewriting | May replace, remove, reorder, clarify, or add information | A broader family; expansion is one strategy |
| Spelling correction | Corrects a likely misspelling | Related preprocessing, not synonymous with semantic expansion |
| Stemming or lemmatization | Normalizes morphological forms | Can reduce mismatch, but does not supply arbitrary conceptual synonyms |
| Explicit relevance feedback | Uses user judgments about retrieved documents | Can expand and reweight a query |
| Pseudo-relevance feedback | Assumes selected initial results are relevant | Automatic local feedback without those user judgments |
| Dense retrieval | Matches learned query/document vectors | Can operate without adding expansion text |
| Learned sparse retrieval | Predicts weighted vocabulary features | Can learn expansion while preserving sparse matching |
| Document expansion | Enriches documents, often before indexing | Changes the document side; doc2query is not Query2doc |
| Re-ranking | Reorders an already retrieved candidate set | Alone cannot recover relevant documents absent from that set |

The distinctions above synthesize the textbook, SPLADE, embedding-expansion, and Query2doc descriptions. Terminology varies across papers: describe the actual pipeline before assigning a category. [S1][S9][S12][S18]

### What Counts as a Useful Expansion?

A useful term is related to the information need, not merely associated with one word in the query. Synonyms, abbreviations, domain terminology, and selected contextual concepts may help. Broader terms can dilute specificity; narrower terms can incorrectly assume a subtopic. [S2][S8][S9]

Illustrative examples, not outputs obtained by running a model:

- `car accident`: `automobile collision` can preserve the intended event.
- `heart attack treatment`: `myocardial infarction` bridges a terminology gap; `cardiac arrest` is not an interchangeable synonym. This is a terminology illustration, not medical advice.
- `bank interest rate`: a financial sense is intended; a river-related sense is inappropriate.
- `laptop repair`: `notebook computer repair` may help; `computer accessories` changes the task.

## Expansion Pipeline

For a typical local-feedback pipeline:

```mermaid
flowchart LR
	Original[Original query] --> First[First-pass retrieval]
	First --> Evidence[Select feedback documents]
	Evidence --> Candidates[Generate candidate terms]
	Candidates --> Filter[Filter and weight terms]
	Original --> Combine[Combine with original query]
	Filter --> Combine
	Combine --> Second[Second-pass retrieval]
	Second --> Evaluate[Evaluate against baseline]
```

Global-resource expansion does not require the first-pass retrieval step. A generative method may use model knowledge alone or condition on retrieved evidence. Some systems use the expanded representation only to rescore a fixed candidate set: that can change ranking, but cannot increase coverage beyond those candidates. [S1][S9][S16][S18]

An implementation design should explicitly specify:

1. The evidence source and whether it depends on initial results.
2. The candidate unit: word, phrase, entity, generated passage, or weighted vocabulary feature.
3. The selection rule, including context or sense filtering.
4. The number of candidates and their weights.
5. How the original query and any mandatory constraints are retained.
6. Whether the final step retrieves from the corpus again or only rescores existing candidates.
7. How quality, regressions, latency, and cost are measured.

### Query Weighting

A useful conceptual model for compatible, normalized query and expansion representations is:

$$
\mathbf{q}_{\mathrm{expanded}} = \lambda\mathbf{q}_{\mathrm{original}} + (1-\lambda)\mathbf{q}_{\mathrm{expansion}}, \qquad 0 \leq \lambda \leq 1.
$$

Here $\lambda$ is the original-query weight: a larger value trusts the original query more. This is an explanatory interpolation model, not a universal implementation formula. Normalization and the meaning of a weight depend on the retrieval model. The embedding-expansion paper uses an analogous interpolation of query language models. [S2][S9]

Do not copy a coefficient from a different library or paper without checking its convention: some definitions attach the coefficient to the expansion rather than the original query.

### Boolean Semantics Matter

The string `car automobile accident collision` does not define a portable search operation. A Boolean engine, a BM25 implementation, and a commercial web search interface may interpret it differently.

For an illustrative Boolean search, expand alternatives within each concept:

```text
(car OR automobile OR motorcar) AND (accident OR collision)
```

Adding every term with `AND` can make retrieval more restrictive. Joining every concept with `OR` can discard the requirement that the result concerns an accident. Ranked retrieval normally needs an explicit weighting strategy rather than assuming Boolean behavior. PubMed documents these operator distinctions and its own automatic mappings. [S2][S14]

## Technique Analysis

### Explicit Relevance Feedback and Rocchio

The user identifies relevant and possibly nonrelevant documents. Rocchio moves a query vector toward the relevant-document centroid and away from the nonrelevant-document centroid. [S7]

$$
\mathbf{q}_{\mathrm{new}} = \alpha\mathbf{q}_{\mathrm{original}}
+ \frac{\beta}{|D_{\mathrm{rel}}|}\sum_{\mathbf{d}\in D_{\mathrm{rel}}}\mathbf{d}
- \frac{\gamma}{|D_{\mathrm{nonrel}}|}\sum_{\mathbf{d}\in D_{\mathrm{nonrel}}}\mathbf{d}.
$$

- $D_{\mathrm{rel}}$ and $D_{\mathrm{nonrel}}$ are the judged document sets.
- $\alpha$, $\beta$, and $\gamma$ control original, positive-feedback, and negative-feedback contributions.
- Omit a centroid term when its document set is empty; do not divide by zero.
- In the textbook's nonnegative term-vector formulation, negative resulting term weights are set to zero.
- The method can introduce terms absent from the original query, as well as reweight existing terms.

Strength: feedback is tied to the user's judgments. Cost: the user must inspect results. Judgment noise or several distinct relevance clusters can still complicate feedback. Do not describe Rocchio as identical to PRF: Rocchio is a vector-update algorithm; PRF specifies how relevance is assumed. A PRF implementation can use Rocchio-style positive feedback without explicit judgments. [S3][S7]

### Pseudo-Relevance Feedback and RM3

PRF avoids asking the user for judgments, but inherits the quality and bias of the first-pass results. Candidate terms should be selected for topical usefulness, not simply because they occur frequently. Stopwords, boilerplate, and overly broad terms are poor feedback evidence. [S3][S9]

RM3 is a widely used relevance-model feedback baseline. Conceptually, it estimates a term distribution from feedback documents, keeps selected expansion terms, and interpolates the feedback model with the original query model. Query2doc evaluates BM25 with RM3 as a separate baseline; the embedding paper explains query-model interpolation and cites the underlying feedback literature. [S9][S18]

Important controls are the number of feedback documents, number of expansion terms, and balance between original and feedback evidence. No universal parameter setting or implementation-specific default is claimed here.

The core failure is query drift. A wrong first-pass result can supply terms that make a wrong second-pass result even more likely. Good average performance can hide damage to individual queries. [S3]

Practical safeguards, proposed here as engineering recommendations rather than universal guarantees:

- Preserve original entities, phrases, and explicit constraints.
- Limit expansion length and feedback depth using development-set evaluation.
- Filter duplicate or low-quality feedback evidence.
- Retain an original-query retrieval path and compare or combine its candidates with the expanded path.
- Skip expansion or request clarification when the intended sense cannot be established.

### WordNet and Controlled Vocabularies

WordNet is a lexical database, not a search engine or a complete domain ontology. Its synsets group words or collocations that are interchangeable in some context. A word can appear in several synsets because it has several senses. Hypernyms are broader classes and hyponyms are more specific kinds. These relations are not all synonym relations. [S8]

A defensible expansion procedure is:

1. Identify important query concepts and parts of speech.
2. Use query context to choose plausible senses.
3. Generate a small set of candidates from appropriate synsets or relations.
4. Filter and weight candidates before querying.

Advantages: inspectable relationships and predictable resource-based behavior. Limitations: sense ambiguity, incomplete coverage of specialized terminology, and vocabulary that depends on resource maintenance. General English WordNet is not sufficient by itself for multilingual or specialized biomedical search. [S2][S8]

For a domain example, PubMed's Automatic Term Mapping consults translation tables including MeSH terms, entry terms, lexical variants, and synonyms. Search Details lets the user inspect the translation. The current guide also documents exceptions: field tags, phrase handling, and wildcards affect mapping, and `[All]` is an important exception to the general field-tag rule. Do not claim that quoting any phrase always disables mapping: an unrecognized quoted phrase can fall back to ATM. [S14]

### Embedding-Based Term Expansion

An embedding model maps text to numerical vectors. Candidate terms or phrases can be ranked by similarity to a query representation, followed by filtering and weighting. One common similarity measure for nonzero vectors is:

$$
\operatorname{cosine}(\mathbf{u},\mathbf{v}) = \frac{\mathbf{u}\cdot\mathbf{v}}{\|\mathbf{u}\|\|\mathbf{v}\|}.
$$

Similarity expresses a learned relationship, not a guaranteed synonym or relevance judgment. Static word embeddings can mix senses; contextual representations use surrounding text, but still depend on training data and retrieval objectives. [S9]

Diaz, Mitra, and Craswell found that corpus- and query-specific embeddings outperformed their global-embedding alternatives for expansion in the studied retrieval settings. Their experiment rescored the first 1,000 query-likelihood candidates and used cross-validation. It therefore does not establish that every modern contextual model should be retrained per query, nor that those experiments recovered documents outside the candidate pool. The authors also discuss the computational cost of local training. [S9]

Distinguish three operations in the talk:

- Selecting additional lexical terms using vector similarity: embedding-based term expansion.
- Encoding the original query and comparing it with document vectors: dense retrieval, with no necessary explicit expansion.
- Encoding an original query plus generated text: expansion combined with dense retrieval.

### Learned Sparse Expansion

SPLADE learns sparse query/document representations over vocabulary features. This permits learned term weighting and expansion while retaining an inverted-index-compatible representation. It is different from representing the entire query as a low-dimensional dense vector. SPLADE v2 also studies a document-expansion-only configuration, so expansion need not occur symmetrically on both sides. [S12]

Presentation role: a short bridge showing that the choice is not simply "traditional keywords or dense AI." Training, sparsity, index size, and retrieval efficiency all enter the design; the inspected abstract does not establish a current best model. [S12]

### LLM-Based Query Expansion

Query2doc generates a pseudo-document and combines it with the original query. In the inspected 2023 preprint, sparse retrieval repeats the original query five times before concatenating the generated text; dense retrieval uses a different concatenation format. Four training-set examples guide generation. These are historical experimental choices, not recommendations to use an obsolete model or to repeat queries in every search engine. [S18]

The LLM used for expansion was not fine-tuned for that task in this setup. That is not the same as "no labeled information": the few-shot prompt contains examples, and the paper's dense-retriever experiments include training settings. [S18]

Jagerman and colleagues independently investigate several prompt strategies for query expansion, including zero-shot and few-shot approaches. Their reported effectiveness depends on the evaluated models, prompts, datasets, and baselines. [S6]

HyDE instead uses the embedding of a generated hypothetical document to retrieve real corpus documents. Its generation is not treated as a verified answer. Although the paper describes a dense bottleneck that can filter misleading generated detail, this is not a guarantee that every hallucination or wrong assumption is removed. [S5]

Other useful designs include multiple query variants and retrieval-conditioned generation. When several variants retrieve overlapping results, combine ranked lists and deduplicate documents; do not assume scores from different retrievers are directly comparable. These are design choices to evaluate, not evidence that more variants always help. [S15][S16]

## Comparison and Method Selection

The following is a qualitative synthesis, not a latency benchmark or universal ranking of methods.

| Method | Evidence source | Main advantage | Principal failure | Operating consideration |
| --- | --- | --- | --- | --- |
| Explicit feedback / Rocchio | User-judged documents | Direct intent evidence | Judgment noise or inconsistent relevance | User effort plus another retrieval step |
| PRF / RM3 | Initial top-ranked documents | Adapts to collection language | Reinforces an incorrect first pass | Feedback processing and usually another search |
| WordNet / thesaurus | Curated senses and relations | Inspectable candidate relationships | Wrong sense or missing terminology | Resource maintenance and controlled term counts |
| Embedding term expansion | Learned term/context representations | Finds relationships beyond exact spelling | Relatedness mistaken for relevance | Similarity lookup; local training can be costly |
| Learned sparse models | Learned vocabulary weights | Combines expansion with sparse matching | Training/domain mismatch | Training and index sparsity trade-offs |
| LLM expansion | Model knowledge and optionally retrieved evidence | Rich contextual reformulation | Invented facts or unsupported assumptions | Generation latency, token cost, longer searches |

Evidence: [S2][S3][S7][S8][S9][S12][S18].

For a specialized catalog or terminology-heavy collection, start by testing controlled vocabulary expansion. For reliable first-pass results, test PRF. For semantic mismatch, evaluate embedding or generative expansion with a strong lexical baseline retained. For exact identifiers, quotations, or highly constrained navigational searches, unneeded expansion can be counterproductive. These are starting hypotheses to test, not guarantees.

## Worked Teaching Example

This is a deliberately constructed six-document corpus, not a Google result, a WordNet lookup, a BM25 experiment, or a published benchmark. Matching is case-insensitive Boolean matching of the displayed words. The information need is **reports or analysis of collisions involving passenger cars**.

| ID | Document text | Relevant to the defined need? |
| --- | --- | --- |
| D1 | car accident safety analysis | Yes |
| D2 | automobile collision report | Yes |
| D3 | motorcar accident investigation | Yes |
| D4 | bicycle road safety | No |
| D5 | vehicle sales | No |
| D6 | driver training guide | No |

There are three relevant documents in this toy collection.

| Search | Retrieved documents | Precision | Recall |
| --- | --- | --- | --- |
| Original: `car AND accident` | D1 | 1/1 = 1.00 | 1/3 = 0.33 |
| Controlled: `(car OR automobile OR motorcar) AND (accident OR collision)` | D1, D2, D3 | 3/3 = 1.00 | 3/3 = 1.00 |
| Uncontrolled: `car OR automobile OR motorcar OR accident OR collision OR road OR vehicle OR driver` | D1, D2, D3, D4, D5, D6 | 3/6 = 0.50 | 3/3 = 1.00 |

Teaching point: useful alternatives recover vocabulary matches, but broad terms and loss of concept structure introduce irrelevant results. The example changes the size of the returned set; it does not demonstrate an unavoidable precision-recall trade-off at a fixed rank cutoff. At a fixed cutoff and fixed relevance set, retrieving more relevant documents increases both precision and recall.

## Published Case Study: Query2doc

These numbers are author-reported results from **arXiv:2303.07678v1, 14 March 2023**, Section 4, Table 4. They are not independently reproduced and are not silently attributed to a different paper version. The source reports scores on a 0-100 scale; the table below divides them by 100. [S18]

| Sparse retrieval input | TREC DL 2019 nDCG@10 | TREC DL 2020 nDCG@10 |
| --- | --- | --- |
| Original query only | 0.512 | 0.477 |
| Generated pseudo-document only | 0.487 | 0.445 |
| Original query plus pseudo-document | 0.662 | 0.629 |

Interpretation: in this experiment, generated text alone was worse than the original query, while the combination was better. This is concrete evidence for preserving original-query information, not proof that generated expansion always wins.

The 2019 difference is 0.150 nDCG units, or 15.0 points on the source's 0-100 scale. Its relative increase is approximately 29.3%, calculated as $(0.662-0.512)/0.512$. Do not describe absolute points as an equivalent relative percentage.

The same preprint reports:

- Mixed out-of-domain results, including minor ranking-quality decreases on NFCorpus and SciFact in its discussion. [S18, Section 3.2]
- Factual errors in generated passages. [S18, Section 4]
- A historical latency comparison for single-thread retrieval of the top 100 MS MARCO development results: 16 ms for BM25 retrieval versus 177 ms for expanded-query retrieval, with generation separately exceeding 2,000 ms. These measurements depend on the reported setup and are not current product latency estimates. [S18, Limitations, Table 6]

For a future slide using numbers, cite the exact preprint version and table, retain the dataset and metric labels, and include the latency/generalization caveat. The EMNLP publication record is separately preserved as [S4].

## Evaluation Framework

### Metrics

For a returned document set $A$ and known relevant set $R$:

$$
\operatorname{Precision} = \frac{|A\cap R|}{|A|}, \qquad
\operatorname{Recall} = \frac{|A\cap R|}{|R|}, \qquad
F_1 = \frac{2PR}{P+R}.
$$

Here $P$ and $R$ in the $F_1$ expression denote precision and recall, respectively. In an implementation, define behavior for empty returned sets, queries with no judged relevant documents, and a zero $P+R$ denominator. [S10]

For web search, the order of results also matters:

| Metric | Main question | Caveat |
| --- | --- | --- |
| Precision@k | How many of the first k results are relevant? | Does not distinguish ordering within the first k |
| Recall@k | How many known relevant documents appear among the first k? | Depends on the available relevance judgments |
| MRR@k | How early is the first relevant result, up to k? | Ignores subsequent relevant results |
| MAP | How well are all judged relevant documents ranked across queries? | Commonly uses binary relevance and a documented depth convention |
| nDCG@k | Are highly relevant results near the top? | Requires a relevance scale, gain rule, cutoff, and normalization |
| Latency / cost | Is improvement practical for the target workload? | Measure generation and retrieval, not just one stage |

For binary relevance, Average Precision for one query is:

$$
\operatorname{AP} = \frac{1}{N_{\mathrm{rel}}}\sum_{r=1}^{N}\operatorname{P@r}\operatorname{rel}(r), \qquad
\operatorname{MAP} = \frac{1}{|Q|}\sum_{q\in Q}\operatorname{AP}(q).
$$

$N_{\mathrm{rel}}$ is the total number of relevant documents under the evaluation judgments; $N$ is the evaluated ranking depth. Relevant documents not retrieved within the evaluated list contribute zero. Specify the evaluator's cutoff convention when reporting truncated AP. [S10]

A common graded-relevance formulation is:

$$
\operatorname{DCG@k} = \sum_{r=1}^{k}\frac{2^{\operatorname{rel}(r)}-1}{\log_2(r+1)}, \qquad
\operatorname{nDCG@k} = \frac{\operatorname{DCG@k}}{\operatorname{IDCG@k}}.
$$

$\operatorname{IDCG@k}$ is the ideal ordering's DCG. State how the evaluator handles queries with zero ideal gain. Do not mix linear and exponential gain conventions in a comparison. [S10]

Recommendation for this presentation: explain precision and recall using the toy example, then use nDCG@10 for ranked web search and Recall@100 or Recall@1000 for candidate coverage. MRR@10 is relevant to the MS MARCO results discussed in Query2doc. F1 can be supplementary; it cannot replace a rank-sensitive metric. [S10][S18]

### Fair Experimental Design

The following is a proposed evaluation plan, not an experiment already performed:

1. Fix a corpus snapshot, query set, relevance judgments, preprocessing, and result depth.
2. Establish an original-query BM25 baseline. When studying dense expansion, also include the same dense retriever without expansion.
3. Compare the baseline with controlled lexical expansion, PRF/RM3, embedding expansion, and one generative method as appropriate to the available resources.
4. Tune term counts, feedback depth, and interpolation weights on development data or inside cross-validation, not on the held-out test judgments.
5. For LLM runs, record model version, prompt, exemplars, generation settings, date, token usage, and generated text. Keep test answers and judgments out of the prompt and tuning loop.
6. Report aggregate metrics and per-query differences, including how many queries are harmed. Use a paired uncertainty estimate or appropriate paired significance test.
7. Inspect failures by intent ambiguity, entity constraints, domain vocabulary, query length, and topic freshness.
8. Report end-to-end latency and cost, including multiple searches, generation, deduplication, and re-ranking when present.
9. Evaluate final answer correctness and evidence support separately if the retrieval method is later used in RAG.

Useful ablations: original query only; expansion only; original plus expansion; different expansion lengths; different feedback depths; and a preserved-original retrieval path. Query2doc supplies an example of why the first three matter. [S18]

Suitable benchmark families include MS MARCO and TREC Deep Learning for passage retrieval, and selected BEIR collections for domain diversity. The BEIR paper evaluated 18 datasets and found BM25 a robust baseline in its 2021 experiments. This does not mean every later paper uses all 18 datasets or that the same system ordering holds today. [S13][S18]

Web-scale recall is generally estimated against available judgments, not all relevant pages on the internet. Pooled judgments may be incomplete. Clicks are useful operational signals but should not be treated as unbiased relevance labels; position and exposure affect what users can click. This dossier does not establish a click-debiasing method. [S10]

## Web Search and RAG Implications

These are practical design considerations synthesized from the documented limitations, not claims about undisclosed Google or Bing production algorithms.

- Intent preservation: preserve named entities, exact identifiers, exclusions, dates, locations, and other constraints where they are part of the need.
- Freshness: a current corpus may know more than the expansion model; stale generated facts can misdirect retrieval.
- Latency: PRF usually adds a retrieval/feedback stage, while generative methods add inference and potentially more expensive long-query searches. [S18]
- Privacy: sending queries or retrieved internal documents to a hosted model creates a data-handling decision. Avoid exposing confidential context without authorization.
- Untrusted text: retrieved pages can contain misleading material or instructions. Treat them as evidence to analyze, not commands that control an LLM's behavior.
- Bias and coverage: lexical resources, training corpora, and query logs can underrepresent some vocabularies or languages. Validate performance on the actual target audience.
- RAG: expansion can improve candidate coverage, but irrelevant context can also hurt the answer stage. Retrieve and cite real evidence; do not pass a generated pseudo-document off as a source. [S5][S18]
- Selective use: expansion is an optional operation. A well-specified query or a weak evidence set may justify preserving the original search or asking for clarification.

## Selected 2025-2026 Developments

This section records recent directions, not an exhaustive state-of-the-art leaderboard. The following records were checked on 2026-09-17; only metadata and abstracts were inspected for these three entries.

| Work | Verified date/version | Direction | Evidence boundary |
| --- | --- | --- | --- |
| Li and colleagues, comprehensive PLM/LLM-era survey | First submitted 2025-09-09; v3 revised 2026-05-07 | Organizes methods by pipeline placement, corpus grounding, learning/alignment, and structured knowledge | Preprint survey; use its abstract for this taxonomy, not an uninspected quantitative claim. [S15] |
| Sun and Surdeanu, AnchorQE | Submitted 2026-08-26 | Encodes original and expanded text separately and interpolates representations; studies integration with frozen dense retrievers | Abstract-level author claims; not independently reproduced and no verified conference acceptance recorded here. [S17] |
| Le and colleagues, EviQE | Abstract page records submission 2026-09-14 | Selects a compact evidence set from several reformulators before grounded expansion | Abstract-level author claims; record includes a related ACM DOI, but its venue/status was not independently checked. [S16] |

Synthesis: the newer work reinforces a long-standing question in expansion: **which evidence should be trusted, and how strongly should it modify the original query?** EviQE reports that extra retrieval-generation rounds can reduce effectiveness once useful conditioning evidence is already selected. AnchorQE investigates how integration, rather than generation alone, affects results. Both motivate experiments; neither establishes a universally best pipeline. [S16][S17]

## Findings About the Existing Slides

| Existing wording or omission | Research implication |
| --- | --- |
| Slide 4 ends its pipeline with "Improved Query" and "Better Retrieval" | Use neutral labels until evaluation establishes improvement. Query drift can reduce quality. [S3] |
| Slide 8 says embeddings "Understand meaning" | Prefer "Capture learned semantic relationships"; similarity is not proof of intent or relevance. [S9] |
| Slide 10 says expansion "improves retrieval" without qualification | Say it "can improve retrieval when added evidence preserves intent." [S2][S3] |
| Three approaches are presented as the main approaches | Keep them as the teaching core, but acknowledge explicit feedback, query-log methods, and generative approaches. [S1][S2][S4] |
| Slide 5 lists `vehicle`, `collision`, `driver`, and `road` without selection or weights | Explain why `collision` may help while broad context terms can dilute the need; show the second retrieval pass. |
| Slide 6 does not explain word senses | Add a short sense-selection warning; hypernyms and hyponyms are not synonyms. [S8] |
| Slide 7 can be read as equating vector search with expansion | Show that selecting new terms is distinct from direct dense retrieval. [S9][S18] |
| Slide 9 lists metrics but gives no baseline or result | Add one worked metric example and an exact source-qualified comparison. [S10][S18] |
| The examples look like possible live model outputs | Label constructed examples clearly; do not imply that WordNet, an embedding model, or a search engine produced them. |
| No references slide | Add traceable source citations when slide development is authorized. |

No slide changes have been made during this research step.

## Proposed Presentation Narrative

This is a planning option, not an implemented redesign. Duration, audience level, and the required slide count have not been specified.

1. Title and domain: Query Expansion Techniques in Information Retrieval; Information Retrieval and Web Search.
2. Vocabulary mismatch: one query and relevant documents using different terminology.
3. The mechanism: candidate generation, filtering, weighting, and retrieval.
4. PRF: top-document assumption, second pass, and query drift.
5. WordNet: synsets, sense selection, and a controlled vocabulary example.
6. Embeddings: learned similarity, local context, and the distinction from dense retrieval.
7. Compare methods: evidence, advantage, failure mode, and cost.
8. Modern extension: Query2doc versus HyDE; optionally mention learned sparse expansion.
9. Evidence and evaluation: toy precision/recall example or the source-qualified Query2doc result.
10. Conclusion and references: preserve intent, retain a baseline, and test quality and cost.

If more time or slides are allowed, separate evaluation from the case study and give references their own slide. Keep Rocchio's full equation, detailed metric definitions, and 2026 papers as backup material for a short introductory talk.

Suggested visuals for later slide development: a vocabulary-mismatch example, a two-pass PRF pipeline, a small word-sense diagram, and a correctly labeled comparison chart. Any embedding projection should be labeled schematic unless computed from an identified model.

## Likely Questions

**Does expansion always improve recall?** No. OR-based candidate-set broadening can preserve set coverage, but ranked cutoffs, changed weights, wrong senses, and other query semantics can reduce Recall@k. [S3][S10]

**Why not add every synonym?** Words have senses, and even sensible candidates can overwhelm the original query when their weights or number are uncontrolled. [S2][S8]

**How is PRF different from relevance feedback?** PRF assumes selected documents are relevant; explicit feedback uses judgments. Neither guarantees a perfect query update. [S1][S3][S7]

**Which technique is best?** The inspected literature does not establish a universal winner. Test against an unchanged retrieval baseline on the target collection and workload. [S9][S13][S18]

**Is semantic search the same as query expansion?** No. Dense retrieval can encode the original query directly without generating new terms. [S5][S9][S18]

**Why retrieve documents after an LLM has written an answer-like passage?** The passage can contain unsupported facts. In Query2doc or HyDE it is a search representation, not verified evidence. [S5][S18]

**Does an older research result describe today's web search engines?** No. Historical benchmark findings and documented product behavior need to be identified separately. Do not infer a commercial engine's current internal architecture from these papers.

## Sources

All entries below were accessed on 2026-09-17. Source IDs label individual records or sections, not necessarily independent papers. Unless otherwise stated, the scope of inspection is the linked HTML page, not an independent reproduction of experiments. This document stores original synthesis and references, not copied full papers.

- [S1] Christopher D. Manning, Prabhakar Raghavan, and Hinrich Schutze. *Introduction to Information Retrieval*, Chapter 9, "Relevance feedback and query expansion." Cambridge University Press, 2008; online edition. Supports vocabulary mismatch and global/local classification. https://nlp.stanford.edu/IR-book/html/htmledition/relevance-feedback-and-query-expansion-1.html
- [S2] Manning, Raghavan, and Schutze. "Query expansion," Section 9.2.2. Supports thesaurus expansion, lower weighting of added terms, controlled vocabularies, and query-log reformulation. https://nlp.stanford.edu/IR-book/html/htmledition/query-expansion-1.html
- [S3] Manning, Raghavan, and Schutze. "Pseudo relevance feedback," Section 9.1.6. Supports the top-document assumption and query drift. https://nlp.stanford.edu/IR-book/html/htmledition/pseudo-relevance-feedback-1.html
- [S4] Liang Wang, Nan Yang, and Furu Wei. "Query2doc: Query Expansion with Large Language Models." EMNLP 2023, pp. 9414-9423. Verified publication metadata and abstract. For the separately inspected preprint version and numerical case study, see [S18]. https://aclanthology.org/2023.emnlp-main.585/
- [S5] Luyu Gao, Xueguang Ma, Jimmy Lin, and Jamie Callan. "Precise Zero-Shot Dense Retrieval without Relevance Labels." ACL 2023, pp. 1762-1777. Verified publication metadata and abstract describing HyDE. https://aclanthology.org/2023.acl-long.99/
- [S6] Rolf Jagerman, Honglei Zhuang, Zhen Qin, Xuanhui Wang, and Michael Bendersky. "Query Expansion by Prompting Large Language Models." arXiv:2305.03653, 2023. Verified abstract and metadata; this record is a preprint, not evidence of a particular conference acceptance. https://arxiv.org/abs/2305.03653
- [S7] Manning, Raghavan, and Schutze. "The Rocchio (1971) algorithm." Full textbook section inspected, including the vector update, weights, and treatment of negative term weights. https://nlp.stanford.edu/IR-book/html/htmledition/the-rocchio71-algorithm-1.html
- [S8] Princeton University WordNet. "wngloss(7WN): Glossary of terms used in WordNet system." Official database organization and glossary inspected for synsets, senses, hypernyms, and hyponyms. https://wordnet.princeton.edu/documentation/wngloss7wn
- [S9] Fernando Diaz, Bhaskar Mitra, and Nick Craswell. "Query Expansion with Locally-Trained Word Embeddings." arXiv:1605.07891v2, 23 June 2016. Metadata and full HTML inspected, particularly Sections 3-7: local training, interpolation, evaluation, candidate-pool boundary, and efficiency limitations. https://arxiv.org/abs/1605.07891 ; https://arxiv.org/html/1605.07891v2
- [S10] Manning, Raghavan, and Schutze. "Evaluation of ranked retrieval results," Chapter 8. Full textbook section inspected for precision/recall, MAP, cutoff metrics, graded nDCG, and incomplete judgments. https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html
- [S11] Claudio Carpineto and Giovanni Romano. "A Survey of Automatic Query Expansion in Information Retrieval." *ACM Computing Surveys*, 44(1), pp. 1-50, January 2012. DOI: 10.1145/2071389.2071390. Publisher-deposited abstract and metadata verified through Crossref; full article not inspected. https://doi.org/10.1145/2071389.2071390 ; https://api.crossref.org/works/10.1145/2071389.2071390
- [S12] Thibault Formal, Carlos Lassance, Benjamin Piwowarski, and Stephane Clinchant. "SPLADE v2: Sparse Lexical and Expansion Model for Information Retrieval." arXiv:2109.10086, 21 September 2021. Abstract and metadata inspected for learned sparse representations and document-only expansion. https://arxiv.org/abs/2109.10086
- [S13] Nandan Thakur, Nils Reimers, Andreas Ruckle, Abhishek Srivastava, and Iryna Gurevych. "BEIR: A Heterogenous Benchmark for Zero-shot Evaluation of Information Retrieval Models." NeurIPS 2021 Datasets and Benchmarks track; arXiv:2104.08663v4. Abstract and acceptance note inspected; supports heterogeneous evaluation and the historical baseline finding. https://arxiv.org/abs/2104.08663
- [S14] U.S. National Library of Medicine. "PubMed User Guide," last updated 1 September 2026. Official sections on Automatic Term Mapping, Search Details, Boolean operators, field tags, phrase searching, wildcards, and MeSH inspected. https://pubmed.ncbi.nlm.nih.gov/help/
- [S15] Minghan Li, Xinxuan Lv, Junjie Zou, Tongna Chen, Chao Zhang, Suchao An, Ercong Nie, and Guodong Zhou. "Query Expansion in the Age of Pre-trained and Large Language Models: A Comprehensive Survey." arXiv:2509.07794v3, revised 7 May 2026. Abstract and version history inspected; preprint survey, not a reproduced experimental comparison. https://arxiv.org/abs/2509.07794
- [S16] Hai Son Le, Amin Bigdeli, Shirin Seyedsalehi, Morteza Zihayat, and Ebrahim Bagheri. "EviQE: Evidence Selection for LLM-Based Query Expansion." arXiv:2609.14875v1, submitted 14 September 2026 according to the abstract page. Abstract and metadata inspected; the record also lists related DOI 10.1145/3799682.3839965, whose venue/status is not independently verified here. https://arxiv.org/abs/2609.14875
- [S17] Siyuan Sun and Mihai Surdeanu. "Query Expansion Is More Than Generation: Improving Dense Retrieval through Better Integration." arXiv:2608.25521v1, 26 August 2026. Abstract and metadata inspected for AnchorQE; no conference acceptance verified. https://arxiv.org/abs/2608.25521
- [S18] Wang, Yang, and Wei. "Query2doc: Query Expansion with Large Language Models." arXiv:2303.07678v1, 14 March 2023. Full HTML inspected, especially Section 2, Section 3.2, Section 4 Table 4, and Limitations Table 6. This is the exact version supporting the stored numerical case study. https://arxiv.org/html/2303.07678v1

## Research Method and Boundaries

- Started from the actual ten-slide draft rather than assuming the topic from the partial name in the request.
- Used Stanford's IR textbook, Princeton WordNet documentation, NLM documentation, ACL publication records, publisher-deposited metadata, and original arXiv records.
- Used an arXiv title search for `query expansion`, sorted by newest announcement, and a Bing search for `"query expansion" survey 2025 2026` to discover recent work. Individual cited records were then checked directly; search snippets were not treated as the final evidence.
- Discovery query: https://arxiv.org/search/?query=query%20expansion&searchtype=title&abstracts=show&order=-announced_date_first&size=25
- Google search returned a JavaScript challenge. WordNet's home page did not extract, so the official glossary was used instead. The classic survey's DOI redirected, so its metadata and abstract were checked through Crossref.
- Attempted PyTerrier rewriting documentation URLs were unavailable or did not extract. They are not cited as inspected evidence, and no library-specific RM3 defaults are claimed. The stored feedback explanation instead uses the inspected textbook and research literature.
- Some arXiv HTML table cells did not extract reliably. The numerical case study uses the readable Table 4 and Table 6 values, not reconstructed missing cells from Table 1.
- Abstract-only sources are suitable for their stated method summaries, but not for uninspected tables, exact implementation recipes, or claims of independent replication.
- Remaining presentation decisions: audience level, duration, required slide count, presenter details, and the desired mathematical depth. These do not block storing the research, but should guide the later slide build.