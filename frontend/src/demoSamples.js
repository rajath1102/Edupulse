/**
 * EduPulse Demo Samples for Evaluation & Presentation
 * Allows instant, zero-latency showcase of Syllabus RAG & University Mock Exam modules.
 */

export const DEMO_SYLLABUS = {
  id: 9999,
  title: 'VTU CS301 - Database Management Systems Official Syllabus',
  subject: 'Database Management (DBMS)',
  fileType: 'TEXT',
  chunkCount: 8,
  rawText: `VISVESVARAYA TECHNOLOGICAL UNIVERSITY, BELAGAVI
Course Title: Database Management Systems
Course Code: 21CS301 / CS53

UNIT 1: INTRODUCTION TO DATABASE SYSTEMS & RELATIONAL MODEL
1.1 Characteristics of database approach, Database users, DBMS Architecture and Data Independence.
1.2 Entity-Relationship (ER) Modeling: Entity Types, Entity Sets, Attributes, Keys (Candidate, Primary, Foreign, Super Key).
1.3 ER diagrams, Specialization, Generalization, and Aggregation.
1.4 Relational Model Concepts, Constraints, Relational Algebra operations (Select, Project, Cartesian Product, Join, Division).

UNIT 2: SQL AND DATABASE DESIGN THEORY
2.1 SQL Data Definition Language (DDL) and Data Manipulation Language (DML).
2.2 Complex queries, Nested subqueries, Views, Triggers, and Assertions.
2.3 Informal Design Guidelines for Relation Schemas, Functional Dependencies (FDs), Inference Rules for FDs (Armstrong's Axioms).
2.4 Normalization of Relational Schemas: First Normal Form (1NF), Second Normal Form (2NF), Third Normal Form (3NF), Boyce-Codd Normal Form (BCNF). Lossless join decomposition and dependency preservation.

UNIT 3: TRANSACTION PROCESSING & CONCURRENCY CONTROL
3.1 Transaction concept, ACID properties (Atomicity, Consistency, Isolation, Durability).
3.2 Transaction states and schedules, Serializability (Conflict and View serializability), Recoverability.
3.3 Concurrency Control Protocols: Lock-based protocols (Two-Phase Locking - 2PL: Strict 2PL and Rigorous 2PL), Timestamp-based ordering, Validation-based protocols.
3.4 Deadlock handling: Deadlock detection, Wait-For Graph, Prevention schemes (Wait-Die, Wound-Wait), Starvation.

UNIT 4: STORAGE AND INDEXING ARCHITECTURES
4.1 File organization and storage, RAID levels.
4.2 Indexing Structures: Primary, Secondary, and Clustering indexes, Single-level and Multi-level indexes.
4.3 Dynamic Multilevel Indexing using B-Trees and B+ Trees (insertion, deletion, search operations).
4.4 Hashing techniques: Static hashing, Dynamic hashing (Extendible and Linear hashing).`
};

export const DEMO_RAG_RESULT = {
  question: 'Explain 3NF vs BCNF according to the syllabus requirements and derivations.',
  subject: 'Database Management (DBMS)',
  documentTitle: 'VTU CS301 - Database Management Systems Official Syllabus',
  aiSource: 'Gemini RAG (Grounded in VTU CS301 Syllabus)',
  answer: `### Official Syllabus Grounding: Unit 2 — SQL & Relational Database Design

According to **Unit 2 (Section 2.4: Normalization of Relational Schemas)** of the university syllabus, here is the exact derivation and comparison between **Third Normal Form (3NF)** and **Boyce-Codd Normal Form (BCNF)** required for university examinations:

#### 1. Formal Definitions from Syllabus

* **Third Normal Form (3NF)**:
  A relation schema R is in 3NF if, for every non-trivial functional dependency X → A:
  1. X is a **Super Key** of R, **OR**
  2. A is a **Prime Attribute** (each attribute in A is part of some candidate key).
  *(3NF permits transitive dependency if the right-hand side attribute is prime).*

* **Boyce-Codd Normal Form (BCNF)**:
  A relation schema R is in BCNF if, for every non-trivial functional dependency X → A:
  1. X must be a **Super Key** of R.
  *(There is strictly NO relaxation for prime attributes on the right-hand side).*

---

#### 2. University Standard Comparison Table (10-Mark Rubric)

| Feature | Third Normal Form (3NF) | Boyce-Codd Normal Form (BCNF) |
| :--- | :--- | :--- |
| **Strictness** | Relaxed standard; eliminates most redundancies | Stricter; eliminates all redundancy based on FDs |
| **Prime Attribute Clause** | Permitted if A is a prime attribute | Strictly not permitted |
| **Dependency Preservation** | **Always guaranteed** to be preserved | **Not always guaranteed** during decomposition |
| **Lossless Join** | Always achievable | Always achievable |
| **Syllabus Example** | Rel (A, B, C) where AB → C and C → B | Requires decomposing into (C, B) and (C, A) |

#### 3. Key Exam Derivation Step
> **Syllabus Note**: Every relation in BCNF is inherently in 3NF, but a relation in 3NF is not necessarily in BCNF. When overlapping candidate keys exist, 3NF allows anomalies that BCNF resolves at the expense of functional dependency preservation.`,
  chunksUsed: [
    {
      heading: 'UNIT 2: SQL AND DATABASE DESIGN THEORY',
      content: '2.4 Normalization of Relational Schemas: First Normal Form (1NF), Second Normal Form (2NF), Third Normal Form (3NF), Boyce-Codd Normal Form (BCNF). Lossless join decomposition and dependency preservation.'
    },
    {
      heading: 'UNIT 2: SQL AND DATABASE DESIGN THEORY',
      content: '2.3 Informal Design Guidelines for Relation Schemas, Functional Dependencies (FDs), Inference Rules for FDs (Armstrong\'s Axioms).'
    }
  ]
};

export const DEMO_MOCK_EXAM = {
  subject: 'Database Management (DBMS)',
  topic: 'Transactions, Concurrency Control & Normalization',
  difficulty: 'Standard University',
  totalMarks: 50,
  durationMinutes: 90,
  aiSource: 'University Examination Board (VTU Standard Evaluation)',
  examPaperMarkdown: `# VISVESVARAYA TECHNOLOGICAL UNIVERSITY
### B.E. / B.Tech Degree Examination — Semester V
### Subject: Database Management Systems (CS301)
**Time Allowed:** 90 Minutes  
**Max Marks:** 50 Marks  

---

### INSTRUCTIONS TO CANDIDATES:
1. Answer **ALL** questions from **SECTION A** (Compulsory, 5 questions × 2 marks = 10 Marks).
2. Answer **ALL THREE** descriptive questions from **SECTION B** (3 questions × 10 marks = 30 Marks).
3. Section B questions carry sub-divisions (a) and (b) with internal mark distribution indicated.
4. Draw neat diagrams and write stepwise relational schema notations wherever applicable.

---

### SECTION A: SHORT ANSWER / CONCEPTUAL QUESTIONS
*(Answer ALL questions. Each question carries 2 Marks — Total: 10 Marks)*

**Q1.** State the **ACID** properties of database transactions and define the significance of **Durability**.  
*[2 Marks]*

**Q2.** Differentiate between a **Candidate Key** and a **Super Key** with a minimal relational example.  
*[2 Marks]*

**Q3.** Define **Conflict Serializability**. How is a precedence (serialization) graph used to verify conflict serializability?  
*[2 Marks]*

**Q4.** State **Armstrong's Axioms** for functional dependency inference (Reflexivity, Augmentation, and Transitivity).  
*[2 Marks]*

**Q5.** Explain why **Two-Phase Locking (2PL)** guarantees serializability but does not prevent **Deadlocks**.  
*[2 Marks]*

---

### SECTION B: DESCRIPTIVE & ANALYTICAL PROBLEMS
*(Answer ALL THREE questions. Each question carries 10 Marks — Total: 30 Marks)*

#### QUESTION 6 (Unit 2: Normalization & Schema Design)
**(a)** A relation R(A, B, C, D, E) has the following set of functional dependencies:  
F = { A → BC,  CD → E,  B → D,  E → A }.  
(i) Find all candidate keys of R.  
(ii) Determine the highest normal form of R. Justify your answer.  
*[6 Marks]*

**(b)** Explain **Boyce-Codd Normal Form (BCNF)**. Prove why every relation in BCNF is in **3NF**, but the converse is not true. Provide an example where 3NF is preserved but BCNF cannot preserve dependencies.  
*[4 Marks]*

---

#### QUESTION 7 (Unit 3: Concurrency Control & Recovery)
**(a)** Consider the following schedule S involving transactions T1, T2, and T3:  
S: R1(X); R3(X); W1(X); R2(Y); W3(X); W2(Y); Commit1; Commit2; Commit3  
(i) Construct the **Precedence Graph** for schedule S.  
(ii) Determine whether schedule S is conflict serializable. If yes, state the equivalent serial order; if not, identify the cycle.  
*[6 Marks]*

**(b)** Explain the working of **Strict Two-Phase Locking (Strict-2PL)** protocol. Contrast its lock release policy with **Rigorous 2PL** and explain how Strict-2PL prevents cascading rollbacks.  
*[4 Marks]*

---

#### QUESTION 8 (Unit 3 & Storage: Deadlock Handling & Indexing)
**(a)** Explain the **Wait-Die** and **Wound-Wait** non-preemptive deadlock prevention schemes using transaction timestamps (TS(Ti) and TS(Tj)). Which scheme avoids starvation, and why?  
*[6 Marks]*

**(b)** Compare **B-Trees** and **B+ Trees**. Explain why B+ Trees are preferred for disk-based database range queries with a neat node structural sketch.  
*[4 Marks]*

---
*End of Examination Paper*`,

  answerKeyMarkdown: `# UNIVERSITY MODEL ANSWER KEY & SOLUTIONS
### Subject: Database Management Systems (CS301) — Max Marks: 50

---

## SECTION A (10 Marks)

### Q1. ACID Properties & Durability (2 Marks)
* **Atomicity:** All-or-nothing execution of transaction operations.
* **Consistency:** Transaction preserves database integrity constraints from one valid state to another.
* **Isolation:** Uncommitted transaction updates are concealed from concurrently executing transactions.
* **Durability:** Once committed, transaction effects persist permanently on non-volatile storage, surviving system crashes.

### Q2. Candidate Key vs Super Key (2 Marks)
* **Super Key:** Any set of attributes that uniquely identifies a tuple in a relation (may contain redundant attributes). Example: (StudentID, Email) in Student(StudentID, Name, Email).
* **Candidate Key:** A minimal Super Key with no extraneous attributes. Example: {StudentID} and {Email} individually.

### Q3. Conflict Serializability & Precedence Graph (2 Marks)
* A schedule is conflict serializable if it is conflict equivalent to some serial schedule.
* **Precedence Graph Rule:** Construct directed graph G = (V, E) where nodes are transactions. A directed edge Ti → Tj exists if Ti and Tj perform conflicting operations on data item Q and Ti executes before Tj. If the graph is acyclic, the schedule is conflict serializable.

### Q4. Armstrong's Axioms (2 Marks)
1. **Reflexivity:** If Y ⊆ X, then X → Y.
2. **Augmentation:** If X → Y, then XZ → YZ for any Z.
3. **Transitivity:** If X → Y and Y → Z, then X → Z.

### Q5. 2PL Serializability vs Deadlocks (2 Marks)
* 2PL divides execution into growing phase (acquiring locks) and shrinking phase (releasing locks).
* Guaranteed serializability: Lock point ordering ensures an acyclic precedence graph.
* Deadlock vulnerability: Transactions holding locks can wait indefinitely for locks held by others in mutual dependency (e.g., T1 holds A requests B; T2 holds B requests A).

---

## SECTION B (30 Marks)

### QUESTION 6
**(a) Candidate Keys & Normal Form of R(A,B,C,D,E) with F = {A → BC, CD → E, B → D, E → A} [6 Marks]:**
1. Attribute Closures:
   * A+ = {A, B, C, D, E} (from A → BC ⇒ ABC; B → D ⇒ ABCD; CD → E ⇒ ABCDE).
   * E+ = {E, A, B, C, D} (since E → A, and A derives all attributes).
   * (CD)+ = {C, D, E, A, B} (since CD → E ⇒ E, and E derives all).
   * (BC)+ = {B, C, D, E, A} (since B → D ⇒ BCD ⇒ CD → E ⇒ ABCDE).
2. **Candidate Keys:** {A}, {E}, {CD}, {BC}.
3. **Normal Form Check:**
   * B → D: B is not a super key, but D is a prime attribute (part of candidate key {CD}). Hence satisfies 3NF condition.
   * All FDs satisfy either LHS is super key or RHS is prime attribute.
   * **Highest Normal Form: 3NF** (violates BCNF because in B → D, B is not a super key).

**(b) BCNF Definition & 3NF Converse [4 Marks]:**
* BCNF requires that for all X → Y, X must be a super key.
* Proof: In 3NF, the rule allows X to be non-superkey provided Y is prime. BCNF disallows this second condition. Hence BCNF ⊂ 3NF.
* Non-preserving example: R(City, Street, Zip) where Zip → City and (City, Street) → Zip. Decomposing into BCNF loses (City, Street) → Zip.

---

### QUESTION 7
**(a) Precedence Graph & Conflict Serializability [6 Marks]:**
* Conflicting operations on X:
  * R3(X) and W1(X): T3 reads before T1 writes ⇒ T3 → T1.
  * W1(X) and W3(X): T1 writes before T3 writes ⇒ T1 → T3.
* **Cycle Detected:** T3 → T1 and T1 → T3 forms a directed cycle.
* **Conclusion:** Schedule S is **NOT conflict serializable** due to the cycle between T1 and T3.

**(b) Strict-2PL vs Rigorous-2PL [4 Marks]:**
* **Strict-2PL:** All exclusive (write) locks acquired by a transaction must be held until the transaction commits or aborts. Shared (read) locks can be released earlier.
* **Rigorous-2PL:** Both shared and exclusive locks are held until commit/abort.
* **Cascading Rollback Prevention:** Because dirty data written by uncommitted transactions is locked exclusively until termination, no active transaction can read uncommitted updates.

---

### QUESTION 8
**(a) Wait-Die vs Wound-Wait Schemes [6 Marks]:**
Let Ti request data locked by Tj:
* **Wait-Die (Non-preemptive):**
  * If TS(Ti) < TS(Tj) (older requests younger): Ti is allowed to wait.
  * If TS(Ti) > TS(Tj) (younger requests older): Ti dies (aborts and restarts with original timestamp).
* **Wound-Wait (Preemptive):**
  * If TS(Ti) < TS(Tj) (older requests younger): Ti wounds Tj (preempts and aborts Tj).
  * If TS(Ti) > TS(Tj) (younger requests older): Ti is allowed to wait.
* **Starvation Avoidance:** Both preserve the original timestamp upon restart. Older transactions steadily gain priority, preventing starvation.

**(b) B-Tree vs B+ Tree Comparison [4 Marks]:**
* B-Tree stores keys and record pointers at both internal and leaf nodes.
* B+ Tree stores actual record pointers only in leaf nodes; internal nodes only store navigation routing keys.
* **Why B+ Tree is preferred for range queries:** Leaf nodes are linked sequentially as a doubly linked list. Range queries execute with a single binary search to the starting leaf followed by sequential traversal, avoiding costly vertical tree traversals.`,

  rubricMarkdown: `# UNIVERSITY STEP-BY-STEP SCORING RUBRIC & MARK SCHEME
### Evaluator Reference Sheet — 50 Marks

---

### SECTION A: SHORT QUESTIONS (10 Marks Total — 2 Marks Each)

* **Q1 (ACID & Durability)**:
  * 1 Mark: Correctly stating and describing Atomicity, Consistency, and Isolation.
  * 1 Mark: Precision definition of Durability with reference to non-volatile persistence across crashes.

* **Q2 (Candidate vs Super Key)**:
  * 1 Mark: Conceptual difference (Super key allows redundant attributes; Candidate key is strictly minimal).
  * 1 Mark: Valid relational example illustrating the distinction.

* **Q3 (Conflict Serializability)**:
  * 1 Mark: Conflict equivalence definition (swapping non-conflicting operations).
  * 1 Mark: Precedence graph topological cycle condition (Acyclic ⟺ Serializable).

* **Q4 (Armstrong's Axioms)**:
  * 0.5 Mark each for Reflexivity, Augmentation, and Transitivity correctly stated (2 Marks for all 3 with notation).

* **Q5 (2PL Serializability vs Deadlocks)**:
  * 1 Mark: Explanation of growing/shrinking phase ensuring serializability.
  * 1 Mark: Explanation of mutual wait condition causing deadlock.

---

### SECTION B: DESCRIPTIVE QUESTIONS (30 Marks Total — 10 Marks Each)

#### QUESTION 6 (10 Marks)
* **Part (a) — 6 Marks**:
  * 2 Marks: Complete derivation of closures A+, E+, (CD)+, (BC)+.
  * 2 Marks: Explicitly identifying all 4 candidate keys.
  * 2 Marks: Step-by-step normal form evaluation testing B → D against prime attribute clause to conclude 3NF.
* **Part (b) — 4 Marks**:
  * 1 Mark: BCNF superkey requirement definition.
  * 1.5 Marks: Mathematical/logical proof showing BCNF is a strict subset of 3NF.
  * 1.5 Marks: Valid dependency preservation counter-example (City, Street, Zip).

#### QUESTION 7 (10 Marks)
* **Part (a) — 6 Marks**:
  * 2 Marks: Correct identification of conflicting pairs (R3(X)/W1(X) and W1(X)/W3(X)).
  * 2 Marks: Neat sketch or clear textual representation of Precedence Graph nodes and edges.
  * 2 Marks: Clear conclusion identifying cycle T1 ↔ T3 with justification that schedule is non-serializable.
* **Part (b) — 4 Marks**:
  * 2 Marks: Definition of Strict-2PL (holding exclusive locks until termination).
  * 1 Mark: Contrast with Rigorous-2PL (holding all locks).
  * 1 Mark: Explanation of preventing cascading aborts (avoiding reading uncommitted dirty writes).

#### QUESTION 8 (10 Marks)
* **Part (a) — 6 Marks**:
  * 2.5 Marks: Accurate rules and condition table for Wait-Die scheme.
  * 2.5 Marks: Accurate rules and condition table for Wound-Wait scheme.
  * 1 Mark: Explanation of starvation prevention via timestamp preservation.
* **Part (b) — 4 Marks**:
  * 2 Marks: Core architectural difference between B-Tree and B+ Tree node structures.
  * 2 Marks: Range query efficiency explanation highlighting leaf node linked list traversal.`
};
