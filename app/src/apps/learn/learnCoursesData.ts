export interface PracticeQuestion {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  example?: string;
  approach: string;
  solutionCode?: string;
  solutionLanguage?: 'cpp' | 'python' | 'sql' | 'text';
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface VideoResource {
  title: string;
  channel: string;
  duration: string;
  url: string;
  thumbnail?: string;
  tag: string;
}

export interface CourseModule {
  id: string;
  title: string;
  readTime: string;
  summary: string;
  conceptNotes: string[];
  keyTakeaways: string[];
  diagramType?: 'sliding-window' | 'linked-list' | 'binary-tree' | 'sql-joins' | 'b-tree' | 'tcp-handshake' | 'subnetting' | 'dns-flow';
  codeSnippets?: {
    title: string;
    language: string;
    code: string;
  }[];
  practiceQuestions: PracticeQuestion[];
  videoResources: VideoResource[];
}

export interface CourseSubject {
  id: string;
  year: '1st Year' | '2nd Year' | '3rd Year';
  subjectName: string;
  code: string;
  badgeColor: string;
  iconName: string;
  description: string;
  modules: CourseModule[];
}

export const CS_CURRICULUM: CourseSubject[] = [
  // ─────────────────────────────────────────────────────────────
  // YEAR 1: DATA STRUCTURES & ALGORITHMS (DSA)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'year1-dsa',
    year: '1st Year',
    subjectName: 'Data Structures & Algorithms',
    code: 'CS-101',
    badgeColor: '#38bdf8',
    iconName: 'Code2',
    description: 'Foundational algorithmic techniques, memory complexity, linear & non-linear data structures, and core coding patterns.',
    modules: [
      {
        id: 'dsa-arrays-pointers',
        title: 'Arrays, Two Pointers & Sliding Window',
        readTime: '12 min read',
        summary: 'Master contiguous memory layout, index manipulation, dynamic subarrays, and in-place two-pointer traversal.',
        conceptNotes: [
          'An **Array** represents a sequence of elements stored in contiguous memory blocks. Element lookup by index operates in **O(1)** time using pointer arithmetic: `address = base_address + index * element_size`.',
          'The **Two-Pointer Technique** uses two indices moving through the array simultaneously (either opposite directions towards each other or same direction at different paces) to optimize O(N²) brute-force comparisons to **O(N)**.',
          'The **Sliding Window Pattern** maintains a dynamic or fixed boundary `[left, right]` across a subarray. By updating internal state incrementally as the window expands or contracts, it solves substring, contiguous subarray sum, and frequency constraint problems in linear time.'
        ],
        keyTakeaways: [
          'Contiguous layout enables O(1) random access but causes O(N) insertion/deletion cost due to shifts.',
          'Two pointers moving inwards is optimal for sorted arrays (e.g., Two Sum II, Container With Most Water).',
          'Sliding window replaces duplicate nested loops with an expand-and-shrink invariant.'
        ],
        diagramType: 'sliding-window',
        codeSnippets: [
          {
            title: 'Sliding Window Pattern (C++)',
            language: 'cpp',
            code: `// Longest Substring Without Repeating Characters - O(N)
int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> charIndex;
    int maxLen = 0, left = 0;
    
    for (int right = 0; right < s.length(); ++right) {
        if (charIndex.find(s[right]) != charIndex.end() && charIndex[s[right]] >= left) {
            left = charIndex[s[right]] + 1; // shrink window past duplicate
        }
        charIndex[s[right]] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-two-sum',
            title: '1. Two Sum (Target Sum Pair)',
            difficulty: 'Easy',
            description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.',
            example: 'Input: nums = [2,7,11,15], target = 9 -> Output: [0,1]',
            approach: 'Use a Hash Map to store each number and its index. For each element `x`, verify if `complement = target - x` already exists in the map.',
            solutionLanguage: 'python',
            solutionCode: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(N)'
          },
          {
            id: 'q-container-water',
            title: '2. Container With Most Water',
            difficulty: 'Medium',
            description: 'Find two lines that together with the x-axis form a container that stores the maximum amount of water.',
            example: 'Input: height = [1,8,6,2,5,4,8,3,7] -> Output: 49',
            approach: 'Initialize two pointers at left (0) and right (N-1). Compute area = min(h[l], h[r]) * (r - l). Advance the pointer with the smaller height, as keeping the shorter pillar can never yield a larger area.',
            solutionLanguage: 'cpp',
            solutionCode: `int maxArea(vector<int>& height) {
    int left = 0, right = height.size() - 1, maxWater = 0;
    while (left < right) {
        int h = min(height[left], height[right]);
        maxWater = max(maxWater, h * (right - left));
        if (height[left] < height[right]) left++;
        else right--;
    }
    return maxWater;
}`,
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(1)'
          }
        ],
        videoResources: [
          {
            title: 'NeetCode — Arrays & Hashing Explained',
            channel: 'NeetCode',
            duration: '24:15',
            url: 'https://www.youtube.com/watch?v=KLlXCFG5TnA',
            tag: 'DSA Video Lecture'
          },
          {
            title: 'Two Pointers & Sliding Window Masterclass',
            channel: 'take U forward (Striver)',
            duration: '38:40',
            url: 'https://www.youtube.com/watch?v=9kdHxplyl5I',
            tag: 'Interview Patterns'
          }
        ]
      },
      {
        id: 'dsa-linked-lists',
        title: 'Linked Lists & Pointer Manipulation',
        readTime: '10 min read',
        summary: 'Understand node architectures, singly and doubly linked chains, sentinel nodes, and cycle detection algorithms.',
        conceptNotes: [
          'A **Linked List** is a dynamic linear data structure composed of discrete node objects allocated in heap memory, each holding data and a pointer reference to the subsequent node.',
          'Unlike arrays, linked lists require no contiguous memory allocation, allowing **O(1)** insertions and deletions once the target node position is reached, but sacrificing O(1) random index access (requiring O(N) linear traversal).',
          "**Floyd's Tortoise and Hare Algorithm** employs two pointers moving at different velocities (slow moves 1 step, fast moves 2 steps) to detect cycles and determine loop start nodes in O(N) time and O(1) auxiliary memory."
        ],
        keyTakeaways: [
          'Sentinel / Dummy Head nodes eliminate cumbersome edge cases when modifying the first node of a list.',
          'Reversing a list requires tracking three pointers simultaneously: `prev`, `curr`, and `next_node`.',
          'Fast and Slow pointers also pinpoint the exact midpoint of a list in a single pass.'
        ],
        diagramType: 'linked-list',
        codeSnippets: [
          {
            title: 'Iterative List Reversal (Python)',
            language: 'python',
            code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head: ListNode) -> ListNode:
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-reverse-linked-list',
            title: '1. Reverse Linked List',
            difficulty: 'Easy',
            description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
            approach: 'Maintain `prev = None` and iteratively rewire each node\'s `next` pointer to point backwards to `prev`.',
            solutionLanguage: 'python',
            solutionCode: `def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(1)'
          },
          {
            id: 'q-linked-list-cycle',
            title: '2. Detect Cycle in Linked List',
            difficulty: 'Easy',
            description: 'Determine if the linked list has a cycle in it without using extra memory.',
            approach: "Use Floyd's Tortoise & Hare: advance slow by 1 and fast by 2. If fast catches up to slow, a cycle exists.",
            solutionLanguage: 'cpp',
            solutionCode: `bool hasCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(1)'
          }
        ],
        videoResources: [
          {
            title: 'Reverse a Linked List — Visual Guide',
            channel: 'NeetCode',
            duration: '11:42',
            url: 'https://www.youtube.com/watch?v=G0_I-ZF0S38',
            tag: 'Algorithms'
          }
        ]
      },
      {
        id: 'dsa-binary-trees',
        title: 'Binary Trees & Tree Traversals',
        readTime: '15 min read',
        summary: 'Recursive structures, Binary Search Trees (BST), Breadth-First Search (BFS) vs Depth-First Search (DFS).',
        conceptNotes: [
          'A **Binary Tree** is a non-linear hierarchical data structure where every parent node possesses at most two child nodes (termed `left` and `right`).',
          'A **Binary Search Tree (BST)** maintains the ordering invariant: for any node $X$, all keys in the left subtree are $< X$, and all keys in the right subtree are $> X$. This guarantees **O(log N)** average search, insertion, and deletion.',
          'Depth-First Search (DFS) yields three canonical orders: **Inorder** (Left, Root, Right — yields sorted order in BST), **Preorder** (Root, Left, Right — serialization), and **Postorder** (Left, Right, Root — deletion / bottom-up aggregation).'
        ],
        keyTakeaways: [
          'Tree algorithms are inherently recursive because subtrees are themselves valid binary trees.',
          'Level-order traversal relies on a FIFO Queue to process nodes layer by layer.',
          'Height-balanced trees (AVL, Red-Black) prevent O(N) degradation caused by skewed trees.'
        ],
        diagramType: 'binary-tree',
        codeSnippets: [
          {
            title: 'Level Order Traversal (BFS) (C++)',
            language: 'cpp',
            code: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> result;
    if (!root) return result;
    
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        int levelSize = q.size();
        vector<int> currentLevel;
        for (int i = 0; i < levelSize; ++i) {
            TreeNode* node = q.front(); q.pop();
            currentLevel.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        result.push_back(currentLevel);
    }
    return result;
}`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-invert-tree',
            title: '1. Invert / Flip Binary Tree',
            difficulty: 'Easy',
            description: 'Given the root of a binary tree, invert the tree, and return its root.',
            approach: 'Recursively swap left and right pointers for each visited node.',
            solutionLanguage: 'python',
            solutionCode: `def invertTree(root: Optional[TreeNode]) -> Optional[TreeNode]:
    if not root:
        return None
    root.left, root.right = invertTree(root.right), invertTree(root.left)
    return root`,
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(H) where H is tree height'
          },
          {
            id: 'q-validate-bst',
            title: '2. Validate Binary Search Tree',
            difficulty: 'Medium',
            description: 'Determine if a given binary tree is a valid Binary Search Tree (BST).',
            approach: 'Pass allowed boundary intervals `(low, high)` downwards recursively. Every node must strictly obey `low < node.val < high`.',
            solutionLanguage: 'cpp',
            solutionCode: `bool isValidBST(TreeNode* root, long minVal = LONG_MIN, long maxVal = LONG_MAX) {
    if (!root) return true;
    if (root->val <= minVal || root->val >= maxVal) return false;
    return isValidBST(root->left, minVal, root->val) && 
           isValidBST(root->right, root->val, maxVal);
}`,
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(H)'
          }
        ],
        videoResources: [
          {
            title: 'Binary Tree Complete Course for Beginners',
            channel: 'take U forward (Striver)',
            duration: '45:10',
            url: 'https://www.youtube.com/watch?v=-DzowlcaUmE',
            tag: 'Comprehensive Lecture'
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // YEAR 2: DATABASE MANAGEMENT SYSTEMS (DBMS)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'year2-dbms',
    year: '2nd Year',
    subjectName: 'Database Management Systems',
    code: 'CS-202',
    badgeColor: '#a855f7',
    iconName: 'Database',
    description: 'Relational data models, SQL queries, normalization, ACID transaction processing, concurrency protocols, and B+ Tree indexing.',
    modules: [
      {
        id: 'dbms-sql-joins',
        title: 'Relational Algebra & SQL Joins',
        readTime: '14 min read',
        summary: 'Declarative SQL query semantics, relational operators, Cartesian products, and inner vs outer join mechanics.',
        conceptNotes: [
          'The **Relational Model** organizes data into tuples (rows) grouped into relations (tables). Relations enforce integrity constraints: Primary Keys (entity uniqueness), Foreign Keys (referential integrity), and Domain Constraints.',
          'An **INNER JOIN** outputs only tuples with matching values in both tables. An **OUTER JOIN** (LEFT, RIGHT, FULL) preserves unmatched tuples from one or both sides, populating absent attributes with `NULL`.',
          'Modern query engines execute joins via three foundational physical operators: **Nested Loop Join** (good for small/indexed relations), **Hash Join** (optimal for large equality joins), and **Sort-Merge Join** (ideal when tables are already ordered).'
        ],
        keyTakeaways: [
          'WHERE filters tuples after joining; ON filters prior to or during join computation for outer joins.',
          'Avoid `SELECT *` in production: reading superfluous columns triggers unnecessary I/O and blocks index-only scans.',
          'Window functions (`ROW_NUMBER()`, `DENSE_RANK()`) calculate aggregates without collapsing row groups.'
        ],
        diagramType: 'sql-joins',
        codeSnippets: [
          {
            title: 'Department Top 2 Salaries (SQL Window Function)',
            language: 'sql',
            code: `WITH RankedSalaries AS (
    SELECT 
        d.name AS Department,
        e.name AS Employee,
        e.salary,
        DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) as rnk
    FROM Employees e
    JOIN Departments d ON e.department_id = d.id
)
SELECT Department, Employee, salary 
FROM RankedSalaries 
WHERE rnk <= 2;`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-sql-second-highest',
            title: '1. Second Highest Salary',
            difficulty: 'Medium',
            description: 'Write an SQL query to report the second highest distinct salary from the Employee table. If not available, report null.',
            approach: 'Use `DISTINCT salary`, order in descending order, then offset by 1 with limit 1, or use subquery with `MAX(salary) < (SELECT MAX(salary) FROM Employee)`.',
            solutionLanguage: 'sql',
            solutionCode: `SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);`,
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(1)'
          },
          {
            id: 'q-sql-customers-orders',
            title: '2. Customers Who Never Order',
            difficulty: 'Easy',
            description: 'Find all customers who never order anything given Customers(id, name) and Orders(id, customer_id).',
            approach: 'Perform a LEFT JOIN from Customers to Orders matching on customer_id, and filter `WHERE Orders.id IS NULL`.',
            solutionLanguage: 'sql',
            solutionCode: `SELECT c.name AS Customers
FROM Customers c
LEFT JOIN Orders o ON c.id = o.customer_id
WHERE o.id IS NULL;`,
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(1)'
          }
        ],
        videoResources: [
          {
            title: 'SQL Tutorial — Full Database Course for Beginners',
            channel: 'freeCodeCamp',
            duration: '4:20:00',
            url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            tag: 'Complete SQL Course'
          },
          {
            title: 'Relational Algebra in DBMS with Solved Examples',
            channel: 'Gate Smashers',
            duration: '18:32',
            url: 'https://www.youtube.com/watch?v=4YilEjkNPrQ',
            tag: 'University Lecture'
          }
        ]
      },
      {
        id: 'dbms-normalization',
        title: 'Normalization (1NF to BCNF)',
        readTime: '16 min read',
        summary: 'Eliminate update anomalies, redundancy, and data inconsistency using functional dependencies and normal forms.',
        conceptNotes: [
          '**Normalization** is the systematic database design process that decomposes tables to eliminate data redundancy and operational anomalies (Insertion, Deletion, and Modification anomalies).',
          '**First Normal Form (1NF)** requires all attribute values to be atomic (no multi-valued sets or nested structures) and guarantees unique row identifiers.',
          '**Second Normal Form (2NF)** is in 1NF and guarantees that every non-prime attribute is fully functionally dependent on the entire candidate key (no partial dependencies on a subset of a composite key).',
          '**Third Normal Form (3NF)** is in 2NF and prohibits transitive dependencies ($X \\rightarrow Y$ and $Y \\rightarrow Z$). Every determinant must either be a superkey or $Z$ is a prime attribute.',
          '**Boyce-Codd Normal Form (BCNF)** is a stricter version of 3NF requiring that for every functional dependency $X \\rightarrow Y$, $X$ must strictly be a Super Key.'
        ],
        keyTakeaways: [
          'Decomposition must always be lossless: $R_1 \\cap R_2 \\rightarrow R_1$ or $R_1 \\cap R_2 \\rightarrow R_2$.',
          'BCNF eliminates all redundancy from functional dependencies but does not always preserve dependencies; 3NF always guarantees dependency preservation.',
          'Denormalization is selectively applied in analytics/warehousing for read latency optimization.'
        ],
        diagramType: 'sql-joins',
        codeSnippets: [
          {
            title: 'Testing Functional Dependency Closure (Pseudocode)',
            language: 'text',
            code: `Algorithm: Compute Attribute Closure (X+)
Input: Set of attributes X, set of FDs F
Output: X+ (all attributes functionally determined by X)

1. X+ = X
2. Repeat until X+ does not change:
     For each FD (Y -> Z) in F:
        If Y is a subset of X+:
           X+ = X+ UNION Z
3. Return X+`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-dbms-candidate-keys',
            title: '1. Finding Candidate Keys from Functional Dependencies',
            difficulty: 'Medium',
            description: 'Given relation R(A, B, C, D, E) and FDs: { A -> BC, CD -> E, B -> D, E -> A }. Identify all candidate keys.',
            approach: 'Compute attribute closures. Since {A}+ = {A, B, C, D, E}, A is a candidate key. Since E -> A, {E}+ includes all attributes. Trace back to identify all minimal superkeys.',
            solutionLanguage: 'text',
            solutionCode: `1. Closure of A: A+ = {A, B, C, D, E} -> A is a candidate key.
2. Since E -> A: E+ = {E, A, B, C, D} -> E is a candidate key.
3. Since CD -> E: (CD)+ = {C, D, E, A, B} -> CD is a candidate key.
4. Since B -> D: (BC)+ = {B, C, D, E, A} -> BC is a candidate key.

Candidate Keys: {A}, {E}, {CD}, {BC}`,
            timeComplexity: 'O(N * |F|)',
            spaceComplexity: 'O(N)'
          }
        ],
        videoResources: [
          {
            title: 'Normalization in DBMS (1NF, 2NF, 3NF, BCNF)',
            channel: 'Gate Smashers',
            duration: '22:18',
            url: 'https://www.youtube.com/watch?v=UrYLYV7WSHM',
            tag: 'Top Rated Lecture'
          }
        ]
      },
      {
        id: 'dbms-transactions-bplus',
        title: 'Transactions, ACID & B+ Tree Indexing',
        readTime: '18 min read',
        summary: 'Concurrency control, Precedence graphs, Two-Phase Locking (2PL), Write-Ahead Logging (WAL), and disk B+ Trees.',
        conceptNotes: [
          'An **ACID Transaction** guarantees: **Atomicity** (all or nothing execution via undo logs), **Consistency** (invariants preserved), **Isolation** (concurrency mimics serial order), and **Durability** (committed updates survive power failure via redo WAL).',
          '**Conflict Serializability** verifies that a non-serial schedule produces equivalent results to some serial execution. It is validated by building a **Precedence Graph**; if the directed dependency graph contains no cycles, the schedule is conflict serializable.',
          'A **B+ Tree** is a self-balancing search tree adapted for block storage. Internal nodes store keys and child page pointers solely for navigation; **all actual records reside in leaf nodes**, which are linked in a continuous doubly linked list to enable blazing-fast range queries.'
        ],
        keyTakeaways: [
          'Two-Phase Locking (2PL) guarantees conflict serializability: transactions acquire locks in the growing phase and release them only in the shrinking phase.',
          'Strict 2PL holds all exclusive write locks until commit/abort, completely preventing cascading aborts.',
          'B+ Trees have high fan-out (order 100+), meaning billions of rows can be navigated with only 3 to 4 disk page reads.'
        ],
        diagramType: 'b-tree',
        codeSnippets: [
          {
            title: 'B+ Tree Search Traversal (Pseudocode)',
            language: 'cpp',
            code: `// B+ Tree Point Query Search
Value search(Node* root, Key target) {
    Node* curr = root;
    while (!curr->isLeaf) {
        int idx = 0;
        while (idx < curr->keys.size() && target >= curr->keys[idx]) {
            idx++;
        }
        curr = curr->children[idx]; // navigate to disk child page
    }
    // Now at leaf page
    for (int i = 0; i < curr->keys.size(); ++i) {
        if (curr->keys[i] == target) return curr->values[i];
    }
    return NOT_FOUND;
}`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-conflict-serializable',
            title: '1. Testing Schedule Conflict Serializability',
            difficulty: 'Medium',
            description: 'Given Schedule S: r1(X), r2(Y), w1(X), r2(X), w2(Y). Test if S is conflict serializable.',
            approach: 'Identify conflicting operations (same item, different transactions, at least one write). S has conflicts: w1(X) before r2(X) -> Edge T1 -> T2. Check for other edges. If no cycles, schedule is serializable.',
            solutionLanguage: 'text',
            solutionCode: `Conflicting Pairs:
1. w1(X) and r2(X) -> T1 must execute before T2 (Edge T1 -> T2).
There are no operations in T2 on X before T1 writes X.
Graph: T1 -> T2 (Acyclic).
Conclusion: Schedule is Conflict Serializable, equivalent to serial order <T1, T2>.`,
            timeComplexity: 'O(V + E)',
            spaceComplexity: 'O(V)'
          }
        ],
        videoResources: [
          {
            title: 'B+ Tree Indexing in Databases',
            channel: 'MIT OpenCourseWare / Systems',
            duration: '31:40',
            url: 'https://www.youtube.com/watch?v=aZjYr87r1b8',
            tag: 'Systems Architecture'
          },
          {
            title: 'ACID Properties & Concurrency Control',
            channel: 'Gate Smashers',
            duration: '19:50',
            url: 'https://www.youtube.com/watch?v=Tbp3xjLp_4Q',
            tag: 'Core Exam Prep'
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // YEAR 3: COMPUTER NETWORKING (CN)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'year3-networking',
    year: '3rd Year',
    subjectName: 'Computer Networking',
    code: 'CS-303',
    badgeColor: '#10b981',
    iconName: 'Network',
    description: 'Protocol architectures, OSI & TCP/IP stack, TCP flow & congestion control, CIDR subnetting, packet routing, and HTTP/3 / TLS 1.3.',
    modules: [
      {
        id: 'cn-osi-layers',
        title: 'The OSI & TCP/IP 7-Layer Protocol Stack',
        readTime: '14 min read',
        summary: 'Layer abstraction, packet encapsulation, hop-by-hop vs end-to-end delivery, and headers at each networking tier.',
        conceptNotes: [
          'The **OSI Model** partitions network communication into 7 modular abstractions: **Physical** (bits over medium), **Data Link** (frames, MAC addresses, switch switching), **Network** (packets, logical IP addressing, routers), **Transport** (segments, port numbers, end-to-end reliability), **Session** (connections), **Presentation** (encoding, TLS encryption), and **Application** (HTTP, SSH, DNS).',
          '**Data Encapsulation**: As data moves down the stack, each layer prepends its own control metadata header (and trailers at L2). At the destination, each layer inspects and decapsulates its header before handing payload upward.',
          '**Addressing Hierarchy**: MAC addresses (L2, 48-bit hex) uniquely identify hardware on a local link; IP addresses (L3, 32-bit or 128-bit) identify internetwork hosts; Port numbers (L4, 16-bit) identify specific software processes on the host.'
        ],
        keyTakeaways: [
          'Switches operate primarily at Layer 2 (MAC learning tables); Routers operate at Layer 3 (IP forwarding tables).',
          'Hop-by-hop delivery is handled by Layer 2 (MAC rewrites at every router hop); End-to-end delivery is preserved by Layer 3 (IP remains constant across hops).',
          'Layer 4 Ports allow a single host IP to multiplex hundreds of simultaneous network applications.'
        ],
        diagramType: 'subnetting',
        codeSnippets: [
          {
            title: 'Encapsulation Pipeline (Protocol Data Units)',
            language: 'text',
            code: `[Application Data]                     --> Layer 7 (PDU: Data)
[TCP Header | Application Data]         --> Layer 4 (PDU: Segment)
[IP Header | TCP Header | Data]         --> Layer 3 (PDU: Packet)
[Ethernet Header | IP | TCP | Data | FCS]--> Layer 2 (PDU: Frame)
10110101001010101000101101001...        --> Layer 1 (PDU: Bits)`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-cn-hop-vs-end',
            title: '1. Hop-by-Hop vs End-to-End Address Modification',
            difficulty: 'Easy',
            description: 'As an IP packet travels across three intermediate routers, which addresses in the packet frame change at every hop, and which remain constant?',
            approach: 'Inspect L2 vs L3. L2 Source & Destination MAC addresses are updated at every router interface. L3 Source & Destination IP addresses remain strictly unchanged (assuming standard routing without NAT).',
            solutionLanguage: 'text',
            solutionCode: `Constant: Source IP & Destination IP (Layer 3).
Modified at each hop: Source MAC (current router outgoing interface) and Destination MAC (next-hop router or destination device interface).`,
            timeComplexity: 'O(1)',
            spaceComplexity: 'O(1)'
          }
        ],
        videoResources: [
          {
            title: 'The OSI Model Explained in Plain English',
            channel: 'NetworkChuck',
            duration: '21:10',
            url: 'https://www.youtube.com/watch?v=vv4y_uOneC0',
            tag: 'Top Visual Explainer'
          },
          {
            title: 'TCP/IP and Networking Fundamentals',
            channel: 'PowerCert Animated Videos',
            duration: '18:45',
            url: 'https://www.youtube.com/watch?v=PpsEaqJV_A0',
            tag: 'Animated Architecture'
          }
        ]
      },
      {
        id: 'cn-tcp-udp-handshake',
        title: 'Transport Layer: TCP Deep Dive vs UDP',
        readTime: '17 min read',
        summary: '3-way handshake connection setup, 4-way teardown, sliding window flow control, and AIMD congestion control algorithms.',
        conceptNotes: [
          '**TCP (Transmission Control Protocol)** is connection-oriented, reliable, byte-stream oriented, and in-order. It establishes state before transmitting data via the **Three-Way Handshake** (SYN $\\rightarrow$ SYN-ACK $\\rightarrow$ ACK).',
          '**Flow Control** ensures a sender does not overwhelm a slow receiver. The receiver advertises its available buffer space in the **Receiver Window (rwnd)** field of every ACK packet.',
          '**Congestion Control** prevents network router saturation using four complementary phases: **Slow Start** (exponential window doubling), **Congestion Avoidance** (Additive Increase: $+1$ MSS per RTT), **Fast Retransmit** (triggered by 3 duplicate ACKs), and **Fast Recovery** (Multiplicative Decrease: halving window size instead of resetting to 1).'
        ],
        keyTakeaways: [
          'UDP is connectionless with zero handshake overhead, no flow/congestion control, and minimal 8-byte headers — ideal for real-time VoIP, video streaming, and gaming.',
          'TCP connection teardown uses a 4-step exchange (FIN, ACK, FIN, ACK) with a 2MSL TIME_WAIT state to ensure delayed duplicate segments drain from the network.',
          'TCP guarantees reliability via sequence numbers, acknowledgment counters, and retransmission timers (RTO).'
        ],
        diagramType: 'tcp-handshake',
        codeSnippets: [
          {
            title: 'TCP 3-Way Handshake Sequence Exchange',
            language: 'text',
            code: `Client                                            Server
  |                                                  |
  |  1. [SYN] Seq = x                                |  (Client enters SYN_SENT)
  |------------------------------------------------->|  (Server enters SYN_RCVD)
  |                                                  |
  |  2. [SYN-ACK] Seq = y, Ack = x + 1               |
  |<-------------------------------------------------|
  |                                                  |
  |  3. [ACK] Seq = x + 1, Ack = y + 1               |  (Client enters ESTABLISHED)
  |------------------------------------------------->|  (Server enters ESTABLISHED)
  |                                                  |
  |             Connection Ready for Data            |`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-tcp-seq-num',
            title: '1. TCP Sequence and Acknowledgment Calculation',
            difficulty: 'Medium',
            description: 'Client sends a TCP segment with Seq = 5000 carrying 1200 bytes of data. What will be the Acknowledgment number sent back by the server upon successful receipt?',
            approach: 'In TCP, the ACK number indicates the NEXT expected byte sequence number: Ack = Seq + Payload_Bytes.',
            solutionLanguage: 'text',
            solutionCode: `Payload starts at byte 5000 and extends to byte 6199 (5000 + 1200 - 1).
The next byte the receiver expects is byte 6200.
Therefore: Ack = 5000 + 1200 = 6200.`,
            timeComplexity: 'O(1)',
            spaceComplexity: 'O(1)'
          }
        ],
        videoResources: [
          {
            title: 'TCP 3-Way Handshake Explained Step by Step',
            channel: 'ByteByteGo',
            duration: '12:05',
            url: 'https://www.youtube.com/watch?v=bW_kWXeqbEo',
            tag: 'System Design Series'
          }
        ]
      },
      {
        id: 'cn-cidr-subnetting',
        title: 'IP Addressing, CIDR Subnetting & Routing',
        readTime: '15 min read',
        summary: 'IPv4 addressing, subnet mask binary math, network vs host bits, prefix length calculations, and OSPF vs BGP routing.',
        conceptNotes: [
          'An **IPv4 Address** contains 32 bits segmented into 4 octets. **CIDR (Classless Inter-Domain Routing)** uses a prefix notation `/N` indicating that the leading $N$ bits constitute the **Network Prefix**, while the remaining $32 - N$ bits address individual **Hosts**.',
          'For a subnet `/N`, the total number of IP addresses is $2^{(32 - N)}$. The first address (all host bits 0) is reserved as the **Network Address**, and the final address (all host bits 1) is the **Directed Broadcast Address**. Usable hosts = $2^{(32 - N)} - 2$.',
          '**Routing Algorithms**: Interior Gateway Protocols (IGP) like **OSPF** use Dijkstra Link-State algorithms within an autonomous system. Exterior protocols like **BGP (Border Gateway Protocol)** route between Autonomous Systems across the global Internet backbone based on path vectors.'
        ],
        keyTakeaways: [
          'A `/24` prefix yields 256 total addresses (254 usable).',
          'A `/30` prefix yields 4 addresses (2 usable hosts), historically used for point-to-point router links.',
          'A `/32` represents a single specific host (loopback interface or host route).'
        ],
        diagramType: 'subnetting',
        codeSnippets: [
          {
            title: 'CIDR Subnetting Fast Cheat Sheet',
            language: 'text',
            code: `Prefix   Subnet Mask        Total IPs    Usable Hosts
/24      255.255.255.0      256          254
/25      255.255.255.128    128          126
/26      255.255.255.192    64           62
/27      255.255.255.224    32           30
/28      255.255.255.240    16           14
/29      255.255.255.248    8            6
/30      255.255.255.252    4            2`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-subnet-calculation',
            title: '1. Calculating Network and Broadcast Address',
            difficulty: 'Medium',
            description: 'Given IP address 192.168.10.138/27, determine: (1) Subnet Mask, (2) Network Address, (3) Broadcast Address, (4) Number of usable host addresses.',
            approach: '/27 has 32 - 27 = 5 host bits. Block size = 2^5 = 32. Look at the last octet 138. The multiples of 32 are 0, 32, 64, 96, 128, 160. 138 falls in [128, 159].',
            solutionLanguage: 'text',
            solutionCode: `1. Subnet Mask: 255.255.255.224 (27 consecutive 1s)
2. Network Address: 192.168.10.128
3. Broadcast Address: 192.168.10.159 (128 + 31)
4. Valid Usable Host Range: 192.168.10.129 to 192.168.10.158 (30 hosts)`,
            timeComplexity: 'O(1)',
            spaceComplexity: 'O(1)'
          }
        ],
        videoResources: [
          {
            title: 'Subnetting is Simple — Master Binary Math',
            channel: 'NetworkChuck',
            duration: '16:40',
            url: 'https://www.youtube.com/watch?v=ecC38318DYI',
            tag: 'Best Visual Guide'
          }
        ]
      },
      {
        id: 'cn-dns-http-tls',
        title: 'Application Protocols: HTTP/3, DNS & TLS 1.3',
        readTime: '16 min read',
        summary: 'Recursive DNS lookup tree, HTTP evolution (1.1 -> 2 -> 3 over QUIC), and TLS 1.3 zero-roundtrip key exchange.',
        conceptNotes: [
          '**DNS (Domain Name System)** resolves human-friendly domain names (e.g. `akademiya.edu`) to IP addresses. The recursive query journey routes: Client $\\rightarrow$ Recursive Resolver $\\rightarrow$ Root DNS (`.`) $\\rightarrow$ TLD DNS (`.edu`) $\\rightarrow$ Authoritative Name Server.',
          '**HTTP Evolution**: HTTP/1.1 suffered from head-of-line blocking on single TCP streams. **HTTP/2** introduced binary framing and stream multiplexing over a single TCP connection. **HTTP/3** replaces TCP with **QUIC over UDP**, eliminating transport-level head-of-line blocking when packets drop.',
          '**TLS 1.3** reduces cryptographic setup from 2-RTT to **1-RTT** (and supports 0-RTT resumption) by combining cipher negotiation with Diffie-Hellman key exchange into the initial ClientHello.'
        ],
        keyTakeaways: [
          'DNS utilizes UDP port 53 for speed, but fails over to TCP port 53 if response size exceeds 512 bytes or during zone transfers.',
          'HTTPS encrypts the application payload, headers, and query parameters; only the destination IP and SNI domain are exposed on the wire.',
          'HTTP/3 connection migration enables smooth switching from Wi-Fi to cellular without dropping active streams.'
        ],
        diagramType: 'dns-flow',
        codeSnippets: [
          {
            title: 'TLS 1.3 1-RTT Handshake Sequence',
            language: 'text',
            code: `Client                                               Server
  |                                                     |
  |  1. ClientHello (Key Share, Ciphers)                |
  |---------------------------------------------------->|
  |                                                     |
  |  2. ServerHello (Key Share, Certificate, Finished)  |
  |<----------------------------------------------------|
  |                                                     |
  |  3. [Encrypted HTTP Request]                        |  (1-RTT achieved!)
  |---------------------------------------------------->|`
          }
        ],
        practiceQuestions: [
          {
            id: 'q-browser-url-journey',
            title: '1. What happens when you type a URL in a browser?',
            difficulty: 'Hard',
            description: 'Detail the end-to-end steps when a user enters https://akademiya.org into the address bar and presses Enter.',
            approach: 'Trace through: (1) DNS resolution, (2) TCP 3-way handshake, (3) TLS 1.3 handshake, (4) HTTP GET request, (5) Server response, (6) DOM parsing and rendering.',
            solutionLanguage: 'text',
            solutionCode: `1. Browser checks local DNS cache; if miss, queries OS resolver -> Root DNS -> TLD (.org) -> Authoritative server to get IP.
2. Browser initiates TCP 3-Way Handshake with server IP on port 443 (SYN -> SYN-ACK -> ACK).
3. Client and server perform TLS 1.3 cryptographic handshake to negotiate session keys.
4. Browser transmits encrypted HTTP GET request.
5. Server web engine processes request and sends HTTP 200 OK with HTML payload.
6. Browser parser constructs DOM + CSSOM, executes scripts, and renders the interface.`,
            timeComplexity: 'O(1)',
            spaceComplexity: 'O(1)'
          }
        ],
        videoResources: [
          {
            title: 'HTTP/1 to HTTP/2 to HTTP/3 (QUIC) Explained',
            channel: 'Hussein Nasser',
            duration: '28:15',
            url: 'https://www.youtube.com/watch?v=a-sBfyiXysI',
            tag: 'Deep Dive Architecture'
          },
          {
            title: 'How SSL / TLS 1.3 Encryption Actually Works',
            channel: 'Computerphile',
            duration: '14:20',
            url: 'https://www.youtube.com/watch?v=T4Df5_cojAs',
            tag: 'Cryptography & Systems'
          }
        ]
      }
    ]
  }
];
