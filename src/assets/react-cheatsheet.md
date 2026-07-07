# React + Next.js Complete Cheatsheet

> Written to actually revise from — every topic has a plain-English explanation of _why it exists and how it works_, not just a one-line definition, plus code examples. Updated for React 19 / Next.js 15+.

---

## Table of Contents

0.  Frontend Fundamentals
1.  JavaScript for React
2.  React Basics
3.  React Hooks
4.  Component Patterns
5.  State Management
6.  Performance Optimization
7.  Forms
8.  Routing
9.  Authentication
10. API Handling
11. Next.js
12. CSS
13. Testing
14. Accessibility
15. Security
16. Frontend System Design
17. Interview Questions
18. Project Architecture
19. Machine Coding
20. Best Practices

---

## 00. Frontend Fundamentals

### How the Browser Works

```
User → Request → Server → HTML → Browser → DOM → CSSOM → Render Tree → Layout → Paint
```

When you type a URL, the browser fetches raw HTML text and has to turn it into pixels on screen. It first parses the HTML top-to-bottom into the **DOM** — a tree of objects representing every tag. While doing that, whenever it hits a `<link>` or `<style>`, it parses the CSS into a separate tree called the **CSSOM**. Neither tree alone tells the browser what to actually draw — so it merges them into a **Render Tree**, which contains only the visible nodes with their final computed styles (a `display: none` element never makes it in here). Then it does **Layout** (a.k.a. reflow): walking the render tree and calculating the exact x/y position and width/height of every box. Finally it **Paints**: filling in actual pixels — text, colors, images, shadows.

This whole pipeline is called the **Critical Rendering Path**, and the reason performance engineers obsess over it is that every one of these steps blocks the next — a slow CSS file delays CSSOM, which delays Render Tree, which delays the very first thing the user sees.

**Why reflow is expensive but repaint isn't:** if you change something that affects geometry (width, font-size, adding an element), the browser has to redo Layout for that element _and potentially everything after it_ in the document, then repaint. But if you only change something purely visual (color, background), it skips Layout and jumps straight to Paint — much cheaper. Changing `transform` or `opacity` is cheaper still: it skips Layout _and_ Paint, going straight to **Composite** (the GPU just moves an already-painted layer around), which is exactly why smooth CSS animations use `transform`/`opacity` instead of animating `top`/`left`/`width`.

### The Event Loop

```
Call Stack → Web APIs → Callback Queue (macrotasks) → Microtask Queue → Event Loop
```

JavaScript is single-threaded — one call stack, one thing executing at a time. So how does `setTimeout` or `fetch` not freeze the page while waiting? They aren't actually handled by the JS engine at all — they're handed off to **Web APIs**, browser-provided machinery running outside your JS thread. When a timer finishes or a network response arrives, the callback you gave it doesn't just jump back onto the stack immediately; it gets placed into a queue, and the **Event Loop** is the mechanism that constantly checks "is the call stack empty? If yes, pull the next thing from a queue and push it onto the stack."

There are two queues, and this is the part that trips people up: the **microtask queue** (Promise `.then`, `queueMicrotask`) is _fully drained_ — every single microtask runs — before the event loop is allowed to pull even one task from the **macrotask queue** (`setTimeout`, UI events, I/O). That's why a `Promise.resolve().then()` always fires before a `setTimeout(fn, 0)`, even though both were "ready" at the same time.

```js
console.log("1");
setTimeout(() => console.log("2"), 0); // macrotask — goes to the back of the line
Promise.resolve().then(() => console.log("3")); // microtask — jumps ahead of any macrotask
console.log("4");
// Output: 1, 4, 3, 2
```

### Rendering Strategies (preview — full depth lives in the Next.js section)

```
CSR:  Browser → JS → React → UI
SSR:  Server → HTML → Browser → Hydration
SSG:  Build time → Static HTML → CDN
ISR:  Static HTML + background regeneration on an interval
```

The core tension here is: _where_ does the HTML get built, and _when_? In **CSR (Client-Side Rendering)**, the server sends an almost-empty HTML shell and a big JS bundle; the browser downloads and runs React to build the actual UI. This is simple to build but bad for SEO (crawlers may see a blank page) and slow on first load. In **SSR (Server-Side Rendering)**, the server runs your React code _for every request_ and sends back fully-formed HTML — great for SEO and fast first paint, but every request costs server compute. **SSG (Static Site Generation)** does the same HTML-building work, but only once, at build time — the result is a plain HTML file served instantly from a CDN, which is why blogs/docs use it. **ISR (Incremental Static Regeneration)** is the middle ground: serve the static file like SSG, but silently regenerate it in the background after a time window, so content stays fresh without paying the SSR-per-request cost.

**Hydration** is the step where React "wakes up" server-rendered HTML — it walks the existing DOM, attaches event listeners and internal state, without re-building the DOM from scratch (that would be wasteful since the HTML is already there and correct). **Streaming** takes this further: instead of waiting for the _entire_ page's data to be ready before sending any HTML, the server sends chunks as they become ready (using Suspense boundaries), so a slow section doesn't block the fast ones from appearing.

---

## 01. JavaScript for React

### Variables: var, let, const

`var` is function-scoped and gets **hoisted** — it's usable (as `undefined`) even before the line it's declared on, and you can redeclare it, which is exactly the kind of loose behavior that causes bugs in loops and closures. `let` and `const` fixed this by being **block-scoped** (confined to the nearest `{}`) and by living in a "Temporal Dead Zone" until their declaration line — accessing them earlier throws, instead of silently giving `undefined`. `const` additionally locks the _binding_ (you can't reassign the variable), but it does **not** deep-freeze the value — you can still mutate properties of a `const` object.

```js
var x = 1; // avoid — function scope, hoisted, redeclarable
let y = 2; // block scope, reassignable
const z = 3; // block scope, binding is fixed, but z.prop = 4 still works if z is an object
```

### Functions: declarations, arrows, IIFEs

Regular `function` declarations get their **own** `this` determined by _how they're called_ (not where they're written), and they're hoisted, so you can call one before its definition appears in the file. Arrow functions were introduced specifically to fix the "what is `this` inside a callback" headache — they don't create their own `this`, `arguments`, or `super`; they just inherit whatever `this` was in the surrounding scope when the function was _written_. This is exactly why arrow functions are the default choice for callbacks and class-field methods in React — you never lose track of `this`.

```js
function greet() {} // own `this`, hoisted
const greet2 = () => {}; // lexical `this` — inherits from enclosing scope
(function () {
  console.log("runs immediately");
})(); // IIFE — used to create an isolated scope
```

### Objects, Arrays, Destructuring, Spread/Rest

Destructuring lets you pull values out of objects/arrays by shape instead of writing `user.name` repeatedly — it reads almost like you're describing the data's structure. Spread (`...`) expands an iterable into individual elements (great for making copies or merging), while rest (also `...`, but on the _receiving_ side) does the opposite — it gathers "everything else" into one variable. The confusing part for beginners is that they use identical syntax but opposite directions of data flow.

```js
const user = { name: "Ru", age: 25 };
const { name, ...rest } = user; // name = 'Ru', rest = { age: 25 }
const arr = [1, 2, 3];
const copy = [...arr, 4]; // [1, 2, 3, 4] — new array, original untouched
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
} // gathers all args into an array
```

### Closures

A closure is what happens when an inner function "remembers" the variables from the scope it was created in, even after that outer function has already finished running. Normally you'd expect `count` to disappear once `counter()` returns — but because the returned arrow function still references it, JS keeps it alive in memory. This isn't a special feature you opt into; it's just how scope works in JS, but it becomes powerful once you realize this is _literally the mechanism_ behind `useState` — each component instance's state variables are kept alive between renders through closures over the fiber's memory cell.

```js
function counter() {
  let count = 0;
  return () => ++count; // this inner function "closes over" count
}
const inc = counter();
inc();
inc(); // 2 — the same `count` persists across calls
```

### Prototype/Inheritance & this/bind/call/apply

Every JS object has an internal link to another object called its **prototype**, and when you access a property that doesn't exist directly on the object, JS walks up this prototype chain looking for it — that's how `array.map()` works even though you never defined `map` on your specific array. `this` is trickier than in most languages because it's not fixed at write-time — it's determined by _how a function is called_. `call`/`apply` let you invoke a function immediately while explicitly choosing what `this` should be (they only differ in how you pass arguments — list vs array). `bind` doesn't invoke anything; it returns a **new function** permanently locked to a given `this`, which is useful when you're handing a callback off to something else (like an event listener) that will call it with the wrong `this` otherwise.

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

const fn = function () {
  return this.name;
};
fn.call({ name: "A" }); // 'A' — invoke now, this = {name:'A'}
fn.apply({ name: "A" }); // same, just different arg-passing style
const bound = fn.bind({ name: "A" }); // returns a new function, this permanently locked
```

### Modules

Before ES Modules, every script shared one giant global scope — one library's `utils` variable could silently overwrite another's. Modules give each file its own private scope; nothing is visible outside it unless you explicitly `export` it, and other files must explicitly `import` what they need. This is what lets bundlers do tree-shaking (section 06) — since imports/exports are static and analyzable, the bundler can see exactly which exports are actually used and delete the rest.

```js
export const add = (a, b) => a + b; // named export — import with matching name
export default function App() {} // default export — import under any name you like
import App, { add } from "./App";
```

### Promises / Async-Await / Fetch

A Promise represents a value that isn't ready yet, but will be — either successfully (`resolved`) or with an error (`rejected`). `async/await` is just syntax sugar over Promises that lets asynchronous code _read_ like synchronous code (no `.then()` chains), while still being non-blocking under the hood — `await` pauses that function (not the whole thread) until the Promise settles.

```js
async function getUser() {
  try {
    const res = await fetch("/api/user"); // pauses here without blocking the rest of the app
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch (e) {
    console.error(e); // fetch only rejects on network failure — you must check res.ok yourself for 4xx/5xx
  }
}
```

### Generators & Iterators

A normal function runs to completion the moment you call it. A **generator** (`function*`) can pause itself mid-execution at every `yield`, handing control back to whoever called it, and resume exactly where it left off when `.next()` is called again. This is the underlying protocol that powers `for...of` loops, spreading, and async iteration — anything "iterable" in JS implements this same next()-returns-{value, done} shape.

```js
function* gen() {
  yield 1;
  yield 2;
}
const it = gen();
it.next(); // { value: 1, done: false } — paused right after the first yield
```

### Map/WeakMap/Set/WeakSet

`Map` and `Set` exist because plain objects are a clumsy way to do key-value storage — object keys are coerced to strings, and there's no clean `.size`. `Map` lets you use _any_ value (even objects/functions) as a key and preserves insertion order. The "Weak" variants only accept object keys, and crucially, they don't prevent garbage collection — if nothing else references that key object, it (and its entry) can be silently cleaned up. This makes `WeakMap` perfect for attaching "private" metadata to an object without causing a memory leak if that object is later discarded elsewhere in your app.

### Proxy & Reflect

A `Proxy` wraps an object and lets you intercept fundamental operations on it — reading a property, setting one, deleting one — and run your own logic instead. `Reflect` provides the matching default implementations of those operations, so inside your Proxy trap you can fall back to "just do the normal thing" without reimplementing it yourself.

```js
const handler = {
  get(target, prop) {
    return Reflect.get(target, prop) ?? `no ${prop}`;
  },
};
const p = new Proxy({}, handler);
p.name; // "no name" — our custom get() trap ran instead of a plain property lookup
```

This is genuinely the core trick behind Vue 3's reactivity system and libraries like Valtio (section 05) — instead of you calling `setState()`, they wrap your state object in a Proxy that detects `state.count = 5` directly and reacts to it.

### Debounce & Throttle

Both exist to stop a rapidly-firing event (typing, scrolling, resizing) from triggering your expensive callback hundreds of times per second. **Debounce** waits for a pause in activity — it keeps resetting a timer on every call, and only actually runs the function once the calls _stop_ for a given delay. That's why it's perfect for search-as-you-type: you don't want to hit the API on every keystroke, only once the user pauses. **Throttle** instead guarantees the function runs at most once per fixed interval, no matter how continuously the event fires — better for scroll/resize handlers where you want steady, periodic updates rather than a single final one.

```js
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

### Currying & Memoization

Currying transforms a function that takes multiple arguments into a chain of functions that each take one (or a few) — useful for building specialized versions of a function by partially filling in arguments ahead of time. Memoization is a caching strategy: if a pure function is called again with the exact same arguments, skip the recomputation and return the previously stored result — a straightforward but powerful optimization for expensive, repeatable calculations.

```js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}
```

### Event Delegation

Instead of attaching a click listener to every single `<li>` in a list (expensive, and broken for items added later), you attach **one** listener to their shared parent and inspect `event.target` to figure out which child was actually clicked. This works because of **event bubbling** — a click on a child element bubbles up through all its ancestors, so the parent gets a chance to react to it too.

```js
document.getElementById("list").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") console.log(e.target.textContent);
});
```

### Deep Copy vs Shallow Copy

Spreading (`{...obj}`) only copies the top level — if a property is itself an object, both the original and the copy point to the _same_ nested object, so mutating the nested part affects both. A deep copy recursively clones everything, so the two are completely independent. `structuredClone` is the modern built-in way to deep clone (handles Dates, Maps, circular references); the old `JSON.parse(JSON.stringify(x))` trick works but silently drops functions, `undefined`, and mangles `Date` objects into strings.

### Execution Context, Hoisting, Scope

Every time a function runs, JS creates an **execution context** for it — a little bundle containing its local variables, its scope chain (what outer variables it can see), and what `this` refers to. **Hoisting** is the (often misunderstood) behavior where `var` declarations and function declarations are processed _before_ the code actually runs line-by-line, effectively moving their declaration to the top of their scope — `var` gets initialized to `undefined` immediately, while `let`/`const` are hoisted too, but stay inaccessible ("Temporal Dead Zone") until their actual line executes.

### Memory & Garbage Collection

JS automatically frees memory using **mark-and-sweep**: periodically, the engine starts from "roots" (global object, currently-executing functions) and marks every object reachable from them; anything left unmarked is considered garbage and gets swept away. The practical danger in React apps is accidentally keeping something "reachable" forever without meaning to — an interval you never `clearInterval`'d, an event listener you never removed in a `useEffect` cleanup, or a closure capturing a huge object that never gets released. None of these are "leaks" in the C++ sense — they're just objects the GC isn't allowed to touch because your code still technically references them.

### 🆕 Signals / Signals Proposal

For years, reactivity in JS frameworks meant "something changed → re-render a whole component → diff the virtual DOM → figure out what actually needs updating." Signals flip that: a **signal** is a container holding a value that _knows_ what's reading it, so when it changes, it can update _exactly_ the piece of the DOM (or computation) that depends on it — no diffing, no re-rendering an entire component tree. This idea proved so useful (Preact, Vue, Solid, Qwik, Angular all converged on some version of it independently) that TC39 now has a **Signals Proposal** aiming to standardize the core primitive directly in the JS language itself, so every framework can build on the same foundation instead of reinventing it.

```js
// Conceptual shape of the proposal
const count = new Signal.State(0);
const double = new Signal.Computed(() => count.get() * 2); // auto-recomputes when count changes
count.set(count.get() + 1);
```

### 🆕 Temporal API

`Date` has been a source of pain since JS's earliest days: it's mutable (any function you pass it to can silently change it), its parsing behavior is inconsistent across engines, and it has essentially no real timezone support — which is why almost every serious app reaches for `date-fns`, `dayjs`, or `moment`. `Temporal` is the long-awaited native replacement: it splits "a date" into precise, purpose-built, **immutable** types — `PlainDate` (just a calendar date, no time/zone), `PlainTime`, `ZonedDateTime` (a real instant tied to a timezone), and `Duration` — so you're never confused about what kind of "time thing" you're holding.

```js
const date = Temporal.PlainDate.from("2026-07-06");
const later = date.add({ days: 10 }); // returns a new PlainDate — the original is untouched
date.until(later).days; // 10 — accurate calendar math built in, no library needed
```

---

## 02. React Basics

### JSX

JSX looks like HTML mixed into JavaScript, but it isn't a special browser feature — it's syntactic sugar that a compiler (Babel/SWC) transforms into plain function calls before your code ever runs. `<h1>Hello</h1>` literally becomes a function call that returns a plain JS object describing "an h1 with this text" — React then reads that object to figure out what to put in the DOM. Understanding this demystifies a lot of "magic": conditionals, loops, and expressions work inside `{}` because it's just JavaScript underneath.

```jsx
const element = <h1>Hello</h1>; // compiles to something like jsx('h1', { children: 'Hello' })
```

### Components, Props, Children

A component is just a function that returns a description of UI — React calls it, gets back JSX, and figures out what DOM to produce. **Props** are how a parent passes data down into that function — they're read-only from the child's perspective (a component should never reassign its own props); if a component wants to change what it renders based on user interaction, it does that with **state**, not by mutating props. `children` is simply the special prop React populates automatically whenever you nest content between a component's opening and closing tags — a pattern that lets you build genuinely reusable "wrapper" components like `Card` or `Modal` without them needing to know anything about what's inside them.

```jsx
function Button({ title }) {
  return <button>{title}</button>;
}
<Button title="Save" />;

function Card({ children }) {
  return <div className="card">{children}</div>;
}
<Card>
  <Text />
</Card>;
```

### Conditional Rendering

Because JSX is just JavaScript, "conditional rendering" isn't a special React feature — it's just using normal JS conditionals inside `{}`. `&&` is a shorthand for "render this only if the condition is true" (careful: if the left side is `0`, React will literally render the number 0 — a classic gotcha), and the ternary is used when you need an actual either/or.

```jsx
{
  isAdmin && <AdminPanel />;
}
{
  isLoggedIn ? <Dashboard /> : <Login />;
}
```

### Lists & Keys

When you render an array with `.map()`, React needs a stable way to tell "this item in the new render" apart from "this item in the old render" so it knows whether to update, move, or destroy/recreate a DOM node. That's what `key` is for — it's not really about rendering the list correctly the first time (that works fine without keys), it's about correctly matching elements across re-renders when the list changes. Using the array **index** as a key seems to work until items get reordered, inserted, or removed — then React matches the wrong old DOM node to the wrong new item, which can cause visually correct-looking but actually-wrong-state bugs (like a text input "remembering" the previous row's typed value after a reorder).

```jsx
{
  items.map((item) => <li key={item.id}>{item.name}</li>);
} // ✅ stable identity across renders
{
  items.map((item, i) => <li key={i}>{item.name}</li>);
} // ❌ breaks if list order changes
```

### Fragments

Every component must return a single root element — but sometimes you don't actually want an extra wrapping `<div>` in the real DOM (it can break CSS layouts relying on direct-child selectors, or invalidate semantic HTML like a `<table>` expecting only `<tr>` children). A Fragment (`<>...</>`) satisfies React's "single root" requirement without adding any actual node to the DOM.

### Controlled vs Uncontrolled Components

In a **controlled** component, React state is the single source of truth for the input's value — you must update state in `onChange` for anything to visibly change, since the `value` prop always wins. This gives you full control (validate/transform on every keystroke) at the cost of a re-render per keystroke. An **uncontrolled** component lets the DOM itself hold the current value, and you only reach in and read it when you need to (via a `ref`) — simpler and faster for cases where you don't need to react to every change.

```jsx
<input value={val} onChange={e => setVal(e.target.value)} /> // controlled
<input ref={inputRef} defaultValue="hi" />                    // uncontrolled
```

### Lifting State Up, Composition, Prop Drilling

If two sibling components need to share or stay in sync on some piece of state, neither of them can "own" it individually — the fix is to move (**lift**) that state up to their closest common parent, which then passes it down as props to both. **Composition** is React's answer to "how do I share behavior without deep inheritance chains" — instead of a `SpecialButton extends Button extends BaseButton`, you build flexible components by nesting/passing components as props (`children`, or named slot props). **Prop drilling** is the pain point that shows up once your component tree gets deep: passing a prop through five layers of components that don't even use it, just to get it to the sixth — which is the practical reason Context (and later, state libraries) exist.

---

## 03. React Hooks

### useState

```
state → setState → Re-render
```

`useState` gives a function component something it otherwise couldn't have: a value that survives between renders. Each render of a component is really just calling that function again from scratch — normal local variables would reset every time — but React stores the state value _outside_ the function call, in the component's internal "fiber," and hands it back to you on each render along with a setter that tells React "something changed, please re-render this component."

Two subtleties matter here. First, calling `setState` doesn't change the variable immediately in the current render — the current `count` you're holding is a snapshot; the update only shows up on the _next_ render. Second, React **batches** multiple `setState` calls that happen within the same event/tick into a single re-render for efficiency (and since React 18, this batching applies almost everywhere — timeouts, promises, native event handlers — not just inside React's own event handlers like it used to). Because of batching, if you need to update state based on its _previous_ value, use the functional form (`setCount(c => c + 1)`) rather than referencing the possibly-stale `count` variable directly — this avoids bugs where multiple rapid updates only "count" as one.

```jsx
const [count, setCount] = useState(0);
setCount((c) => c + 1); // safe even if called multiple times before a re-render happens
```

### useEffect

```
Mount → Update → Unmount
```

Rendering in React is supposed to be a pure calculation: given props/state, produce JSX — no side effects (network calls, subscriptions, manually touching the DOM) allowed during that phase. `useEffect` is the escape hatch: it lets you run code _after_ React has committed the render to the DOM, specifically for things that reach outside React (fetching data, setting up a subscription, manipulating a non-React widget). The dependency array tells React "only re-run this effect if one of these values changed since last render" — leave it off entirely and it runs after every single render (usually not what you want); leave it empty and it only runs once, right after the first render.

The **cleanup function** (the function you `return` from inside the effect) runs right before the effect runs again, and also on unmount — it exists so that anything you "set up" (a timer, a subscription, an event listener) gets properly "torn down," otherwise you accumulate duplicate timers/listeners every time the effect re-runs.

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // runs before the next effect, and on unmount
}, [dep]);
```

**Common mistakes:** forgetting the dependency array (runs every render — often causing infinite loops if the effect itself sets state that's in its own dependencies); putting a freshly-created object/array/function literal in the dependency array (it's a _new reference_ every render, so React thinks it "changed" every time even if the contents look identical); forgetting cleanup, which quietly leaks memory/duplicated subscriptions over time.

### useRef

A `ref` gives you a mutable box (`{ current: ... }`) that persists across renders _without_ causing a re-render when you change it — the opposite trade-off from state, which persists but _does_ trigger re-renders. This makes it perfect for two very different jobs: holding a direct reference to a real DOM node (so you can call `.focus()` or measure it), and holding any value you want to remember across renders but that has no business influencing what gets rendered (a previous value, a timer ID, a render count for debugging).

```jsx
const inputRef = useRef(null);
useEffect(() => inputRef.current.focus(), []);
```

### useMemo, useCallback, React.memo

All three exist purely to skip unnecessary work, and they solve three different flavors of the same underlying problem: React re-runs your whole component function on every render, which means every expensive calculation, every function definition, and every child render happens again by default — even if nothing relevant actually changed. `useMemo` caches the **result of a calculation** between renders, recomputing only if a dependency changed. `useCallback` caches a **function's reference** itself (not its result) — useful because passing a brand-new function to a memoized child every render would defeat that child's memoization (new reference = "props changed" as far as `React.memo`'s shallow comparison is concerned). `React.memo` wraps a whole component and tells React "skip re-rendering this if the props are shallow-equal to last time."

```jsx
const sorted = useMemo(() => expensiveSort(list), [list]);
const handleClick = useCallback(() => doThing(id), [id]);
const Memoized = React.memo(Child);
```

### useReducer

```
dispatch → reducer → new state
```

`useState` gets awkward once your state update logic itself gets complicated — many related fields, or updates that depend on multiple pieces of previous state at once. `useReducer` centralizes "how state changes" into one pure function (the reducer) that takes the current state plus an "action" describing _what happened_, and returns the new state — you never mutate state directly, you `dispatch` an action describing intent, and let the reducer decide the resulting shape. This is the same mental model Redux is built on, just scoped to one component/hook instead of the whole app.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "inc":
      return { count: state.count + 1 };
    default:
      return state;
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0 });
```

### Context API

Props naturally flow one direction: parent to child. Context exists for the case where a value (theme, logged-in user, locale) is needed by many components at very different depths, and manually threading it through every intermediate component (prop drilling) would be absurd. A `Provider` makes a value available to its entire subtree, and any descendant can read it directly with `useContext` — skipping every layer in between. The trade-off: any component consuming a context re-renders whenever that context's value changes, so Context is best for values that change infrequently (theme, auth) rather than something like "current mouse position."

```jsx
const ThemeContext = createContext("light");
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>;
const theme = useContext(ThemeContext);
```

### Custom Hooks

A custom hook is just a regular function that happens to call other hooks inside it, named with a `use` prefix by convention so React (and linters) know it follows the Rules of Hooks. Their entire purpose is extracting reusable **stateful logic** out of components — if you find yourself copy-pasting the same `useState` + `useEffect` combo across multiple components, that's the signal to pull it into a custom hook instead.

```jsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}
```

### useLayoutEffect vs useEffect

Both look identical, but timing is the whole story: `useEffect` runs _after_ the browser has painted the screen, so if your effect changes something visually, the user briefly sees the "before" state flash before it updates. `useLayoutEffect` runs synchronously _before_ the browser paints — React waits for it to finish before showing anything — which is exactly what you want for DOM measurements that then affect layout (e.g., measuring an element's height to position a tooltip), so there's no visible flicker. The trade-off is that `useLayoutEffect` blocks painting, so overusing it can make your app feel less responsive.

### useImperativeHandle

Normally, a parent can't reach "into" a child component and call methods on it — data flows down via props, not imperative method calls. `useImperativeHandle` (paired with `forwardRef`) is the deliberate escape hatch for the rare cases you actually need that — like exposing a `.focus()` or `.scrollIntoView()` method on a custom input component to a parent holding its ref.

```jsx
const Input = forwardRef((props, ref) => {
  const localRef = useRef();
  useImperativeHandle(ref, () => ({ focus: () => localRef.current.focus() }));
  return <input ref={localRef} />;
});
```

### useTransition & useDeferredValue

Both exist to solve the same UX problem: a state update that's expensive to render (like re-filtering a huge list on every keystroke) can make the whole UI feel laggy, because React normally treats every update as equally urgent. `useTransition` lets you explicitly mark an update as **low priority/interruptible** — React will still keep the input itself feeling instant, and will render the expensive part in the background, throwing it away and restarting if a newer update comes in first. `useDeferredValue` is a slightly different angle on the same idea: instead of marking the _update_ as low priority, you get a "lagging behind" copy of a fast-changing value, letting you render the expensive part against the deferred (slightly stale) value while the input itself stays instantly responsive.

```jsx
const [isPending, startTransition] = useTransition();
startTransition(() => setFilter(input));

const deferredQuery = useDeferredValue(query);
```

### useId & useSyncExternalStore

`useId` generates a unique, stable ID string per component instance — the reason it exists rather than just using `Math.random()` yourself is SSR: server and client need to generate the _exact same_ ID for hydration to match up correctly, and `useId` guarantees that. `useSyncExternalStore` is the official, safe way to read state that lives **outside** React entirely (a browser API, a third-party store) — reading external state naively can cause subtle tearing bugs under React's concurrent rendering; this hook is the primitive that libraries like Redux/Zustand now use internally to subscribe safely.

### 🆕 React 19: useActionState (formerly useFormState)

Before this hook, wiring up a form that calls a server, shows a pending spinner, and displays a result/error required manually juggling `useState` for the result, `useState` for a loading flag, and an `onSubmit` handler with try/catch — all repeated for every form. `useActionState` bundles all three concerns into one hook tied directly to a form's `action`: you give it an async function (which receives the previous state and the submitted `FormData`), and it gives you back the latest returned state plus a `pending` flag, automatically kept in sync with the form submission lifecycle.

```jsx
function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) return { error: "Failed to send" };
      return { success: true };
    },
    { success: false },
  );

  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={isPending}>{isPending ? "Sending..." : "Send"}</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

### 🆕 React 19: useFormStatus

A submit button is often a separate, reusable component nested deep inside a `<form>` — but it needs to know "is the parent form currently submitting?" to disable itself or show a spinner. Before this hook, that meant passing an `isPending` prop down manually (prop drilling, again). `useFormStatus` lets any component rendered _inside_ a `<form>` read that form's pending/submitted-data status directly, with zero props passed — it only works when called from a descendant of the form, not the form's own component.

```jsx
function SubmitButton() {
  const { pending } = useFormStatus(); // reads the ancestor <form>'s status directly
  return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
function Form() {
  return (
    <form action={saveAction}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
```

### 🆕 React 19: use API

`use` isn't technically a hook (it can be called conditionally or inside loops, which normal hooks can't), and it solves two problems at once. First, reading a **Promise**: instead of manually juggling `useEffect` + `useState` to fetch data and track loading, you can pass a Promise straight into `use()`, and it "suspends" the component (pausing rendering, showing the nearest Suspense fallback) until the Promise resolves — no boilerplate state needed. Second, reading **Context conditionally**, which `useContext` never allowed because hooks must run unconditionally on every render — `use(SomeContext)` can safely sit inside an `if` block.

```jsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise); // suspends until resolved, no useEffect needed
  return comments.map((c) => <p key={c.id}>{c.text}</p>);
}
function Banner({ show }) {
  if (!show) return null;
  const theme = use(ThemeContext); // ✅ conditional — not allowed with useContext
  return <div className={theme}>Banner</div>;
}
```

---

## 04. Component Patterns

**Container/Presentational** was an early convention for separating "what data does this need and how do I get it" (container) from "how does this look" (presentational, pure props-in JSX-out). Hooks have largely absorbed this — a custom hook now plays the role the container component used to — but the underlying idea (separate data concerns from rendering concerns) is still worth applying.

**Compound Components** let a parent and its children implicitly share state/behavior without you manually wiring props between them — internally, the parent typically sets up a Context provider, and each child (like `Select.Option`) reads from it, so from the outside it just looks like natural, readable nesting.

```jsx
<Select>
  <Select.Option value="a">A</Select.Option>
  <Select.Option value="b">B</Select.Option>
</Select>
```

**Render Props** is an older pattern for sharing logic: instead of a component deciding what to render itself, it accepts a function as a prop and calls it with whatever data/state it manages, letting the _caller_ decide the actual markup. Hooks have replaced most use cases for this (a custom hook is usually simpler than a render-prop wrapper), but you'll still see it in some libraries.

```jsx
<DataFetcher render={(data) => <List data={data} />} />
```

**HOC (Higher-Order Component)** is a function that takes a component and returns a new, enhanced component — a way to reuse cross-cutting logic (like "require auth before rendering this") across many components without repeating the logic in each one.

```jsx
function withAuth(Component) {
  return function Wrapped(props) {
    const user = useAuth();
    return user ? <Component {...props} /> : <Login />;
  };
}
```

**Headless Components** provide all the _behavior_ and accessibility wiring (keyboard nav, ARIA attributes, open/close state) with zero visual opinion — you supply 100% of the markup/styling yourself. This has become popular (Radix UI, Downshift, TanStack Table) because it separates "hard to get right" (accessible interaction logic) from "highly variable per-project" (visual design), letting you reuse the former without inheriting someone else's design system.

**Polymorphic Components** let you change the underlying rendered HTML tag while keeping the same component's styling/behavior — e.g. a `Button` that can render as an actual `<a>` tag when it needs to behave like a link, without duplicating the styling logic in two separate components.

```jsx
<Button as="a" href="/home">
  Home
</Button>
```

**Slot Pattern** generalizes `children` into multiple _named_ insertion points (`header`, `footer`, `sidebar` props that are themselves JSX) — useful when a component's layout has more than one distinct "hole" that the caller needs to fill independently.

---

## 05. State Management

### When is useState/useReducer Enough?

Not everything needs a state library. If a piece of state is only relevant to one component (or naturally lifted to its direct parent) — a toggle, a form field's value, whether a modal is open — plain `useState`/`useReducer` is simpler, has zero extra dependencies, and is easier to reason about than routing it through a global store.

### The Landscape

| Library                      | Type                       | Best for                                                        |
| ---------------------------- | -------------------------- | --------------------------------------------------------------- |
| Context                      | Built-in                   | Low-frequency updates (theme, auth user)                        |
| Redux Toolkit                | Flux/reducer               | Large apps needing strict predictability + devtools/time-travel |
| Zustand                      | Minimal store              | Small-medium apps wanting a simple API with less boilerplate    |
| Jotai                        | Atomic                     | Fine-grained state built bottom-up from small atoms             |
| MobX                         | Observable                 | OOP-style code with automatic reactivity                        |
| Recoil                       | Atomic (Meta)              | Similar to Jotai, less actively maintained now                  |
| React Query / TanStack Query | Server cache               | Caching/refetching/syncing _remote_ async data                  |
| RTK Query                    | Server cache (Redux-based) | Same job as React Query, inside the Redux ecosystem             |

The reason this list looks so crowded is that "state management" actually covers at least two very different problems people used to lump together: **client UI state** (is this dropdown open, what's in this form) and **server cache state** (data that actually lives in a database somewhere and you're just holding a synced copy of). Redux/Zustand/Jotai are built for the former; React Query/RTK Query are purpose-built for the latter, handling things Redux was never designed for out of the box — automatic refetching, stale-while-revalidate caching, request deduplication.

### 🆕 Signals-Based Libraries

Both **Preact Signals** and **Valtio** take a fundamentally different approach from "call setState, trigger a re-render, diff the tree": they track dependencies at the _property_ level, so updating one field only notifies the specific pieces of UI that actually read that field — skipping the virtual DOM diff step for that update entirely. Valtio specifically wraps a plain object in a JS `Proxy` (see section 01), so you write completely ordinary-looking mutations (`state.count++`) and it detects the change automatically; `useSnapshot` gives your component a reactive, read-only snapshot that only triggers a re-render on properties your component actually accessed.

```jsx
import { proxy, useSnapshot } from "valtio";
const state = proxy({ count: 0 });
function Counter() {
  const snap = useSnapshot(state);
  return <button onClick={() => state.count++}>{snap.count}</button>;
}
```

### Decision Tree (Updated for RSC)

```
Need server cache?
│
├── Yes → React Query / RTK Query
│         (or Next.js Server Components / Server Actions —
│          native `fetch` caching + revalidation often replaces
│          React Query entirely in a Next.js app)
│
└── No
    └── Context (low-frequency) → Redux/Zustand (complex/global client state)
```

The big shift in 2025-2026 thinking: **React Server Components fetch data on the server and stream the _result_ down as already-rendered UI** — there's no client-side cache to manage because the client never held the raw data to begin with. That means, in a Next.js App Router project, a large share of what used to justify pulling in Redux or Zustand (just to store and share fetched API data across components) simply isn't needed anymore — the server did the fetching, and Next's own `fetch` caching/`revalidatePath` handles freshness. Client state libraries are increasingly reserved for what's genuinely client-only and interactive (an open modal, a multi-step wizard's current step, drag state) rather than as a parking lot for server data.

## 06. Performance Optimization

**React.memo** exists because, by default, a child component re-renders every time its parent re-renders, _even if the child's own props didn't change_. Wrapping it in `React.memo` tells React to shallow-compare the new props against the old ones first, and skip re-rendering entirely if they're the same — worthwhile for components that render often but rarely receive genuinely new data.

```jsx
const Row = React.memo(function Row({ item }) {
  return <li>{item.name}</li>;
});
```

**Code Splitting, Lazy Loading, Suspense** tackle a different problem: bundle size. Shipping your entire app as one JS file means users download code for pages they may never visit. `React.lazy` + dynamic `import()` split a component into its own chunk, only fetched when it's actually needed; `Suspense` provides the fallback UI to show while that chunk is downloading.

```jsx
const Settings = React.lazy(() => import("./Settings"));
<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>;
```

**Dynamic Import** is the same idea outside of React components — deferring the download of a whole module until the moment it's actually used, e.g. only loading a heavy charting library once the user clicks "show chart."

```js
button.addEventListener("click", async () => {
  const { heavyFn } = await import("./heavyModule.js");
  heavyFn();
});
```

**Windowing / Virtualization** solves the "list with 10,000 rows" problem: rendering all 10,000 DOM nodes would be catastrophically slow and mostly wasted, since only ~20 are visible in the viewport at once. Libraries like `react-window` render only the visible slice (plus a small buffer) and recycle DOM nodes as you scroll, keeping performance constant regardless of list size.

**Image Optimization** matters because images are usually the heaviest assets on a page. The core techniques are: serving appropriately-sized images per device (`srcset`), using modern compressed formats (WebP/AVIF instead of PNG/JPEG), and lazy-loading images below the fold so they don't compete with above-the-fold content for bandwidth. Next.js's `<Image>` component automates all three.

**Tree Shaking & Bundle Splitting** happen at build time: because ES Modules declare imports/exports statically (see section 01), a bundler can trace exactly which exports are actually used anywhere in your app and delete ("shake out") the rest from the final bundle. Bundle splitting is the complementary idea of breaking the _used_ code into multiple files, so a user only downloads what a given page needs instead of one giant bundle.

**Profiler, Lighthouse, Web Vitals** are how you actually _measure_ whether any of the above helped, rather than guessing. The **React Profiler** (a DevTools tab) shows how long each component took to render per commit — invaluable for finding which specific component is the bottleneck. **Lighthouse** runs an automated audit covering performance, accessibility, SEO, and best practices, producing a score plus concrete suggestions. **Core Web Vitals** are Google's three headline real-world metrics: **LCP** (how long until the largest visible element renders — a loading metric), **INP** (how long the page takes to respond to a user interaction — replaced FID in 2024 as the responsiveness metric), and **CLS** (how much visible content unexpectedly shifts around — a visual-stability metric, usually caused by images/ads loading without reserved space).

### 🆕 React Compiler (React Forget)

For years, avoiding unnecessary re-renders meant manually sprinkling `useMemo`/`useCallback`/`React.memo` throughout your code — and doing it _correctly_ (right dependency arrays, not over- or under-memoizing) was genuinely hard to get consistently right, even for experienced React developers. The React Compiler, released alongside React 19, is a **build-time tool** that statically analyzes your component code and automatically inserts the equivalent of memoization wherever it can prove doing so is safe — meaning you can write plain, un-memoized code and still get most of the performance benefit.

```jsx
// Before (manual memoization)
const total = useMemo(() => items.reduce((a, b) => a + b.price, 0), [items]);
const handleClick = useCallback(() => onSelect(id), [id]);

// After React Compiler — write plain code, compiler inserts memoization at build time
const total = items.reduce((a, b) => a + b.price, 0);
const handleClick = () => onSelect(id);
```

It's important to understand _why_ the compiler can't replace manual memoization 100% of the time: it only optimizes code that provably follows the **Rules of React** (pure rendering, no side effects during render) — anything it can't statically prove safe, it leaves alone. So you still reach for manual `useMemo`/`useCallback` when: a value comes from outside React and the compiler can't trace its stability, the calculation involves non-deterministic logic, or you're working in a codebase/library where compiler adoption is partial. It also doesn't touch virtualization, code-splitting, or effect-related performance — it purely removes the _re-render memoization_ boilerplate, not every performance concern in section 06.

---

## 07. Forms

**Controlled Forms** put React state in charge of every field's value — necessary if you need to validate/transform on every keystroke, but it means a re-render fires on every character typed.

```jsx
const [email, setEmail] = useState("");
<input value={email} onChange={(e) => setEmail(e.target.value)} />;
```

**React Hook Form** takes a different approach: fields stay _uncontrolled_ by default (the DOM holds the value, not React state), and the library only reads values when needed (on submit, or on-demand validation) — this avoids a re-render per keystroke, which is why it noticeably outperforms controlled-everything forms on large/complex forms.

```jsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("email", { required: true })} />
  {errors.email && <span>Required</span>}
</form>;
```

**Formik** solves the same problem as React Hook Form but predates it and leans more on controlled inputs internally, which is part of why it re-renders more and has fallen out of favor for new projects — still common in older codebases though.

**Validation — Yup vs Zod**: both let you declare a data shape once and validate against it, instead of writing ad-hoc `if` checks scattered through your form logic. Zod has become the more popular default in TypeScript projects specifically because it infers a matching TypeScript type directly from the schema — you define validation once and get type-safety for free, without keeping a separate interface in sync.

```js
import { z } from "zod";
const schema = z.object({ email: z.string().email(), age: z.number().min(18) });
schema.parse(formData); // throws if formData doesn't match the shape
```

**File Upload / Drag & Drop**: file inputs are inherently uncontrolled (browsers won't let JS set a `<input type="file">`'s value for security reasons), so you always read the selected file(s) from the event/ref rather than driving it with state. Drag-and-drop is built on the browser's native `dragover`/`drop` events — you must call `preventDefault()` on `dragover`, or the browser's default "reject the drop" behavior takes over and `drop` never fires.

```jsx
<input type="file" onChange={e => setFile(e.target.files[0])} />
<div onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
     onDragOver={e => e.preventDefault()}>
  Drop files here
</div>
```

---

## 08. Routing

**React Router** solves a fundamental SPA problem: once you've moved away from full page reloads for navigation, _something_ needs to sync the URL with what's on screen, handle back/forward buttons, and let you deep-link into a specific view. It does this by intercepting navigation, matching the current URL against a route tree, and rendering the matched component — all without a real page reload.

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/user/:id" element={<UserDetail />} />{" "}
    {/* :id becomes a URL param you read via useParams() */}
    <Route path="*" element={<NotFound />} />{" "}
    {/* catch-all for unmatched paths */}
  </Routes>
</BrowserRouter>
```

**Nested Routes** mirror how UIs actually nest: a dashboard layout with its own persistent header/sidebar, inside which different sub-pages swap in and out. Rather than re-rendering the whole layout for every sub-page, nested routes let a parent route render its shared UI once, with an `<Outlet/>` marking where the matched child route's content goes.

```jsx
<Route path="dashboard" element={<Dashboard />}>
  <Route path="settings" element={<Settings />} />{" "}
  {/* renders inside Dashboard's <Outlet/> */}
</Route>
```

**Protected Routes** are how you gate access without a real backend redirect — a wrapper component checks auth state _before_ rendering the actual protected content, and renders a `<Navigate>` (client-side redirect) to the login page instead if the check fails.

```jsx
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}
```

**Lazy Routes** combine routing with code-splitting (section 06) — there's no reason to download the JS for `/dashboard` if the user is currently sitting on `/`, so the route's component is only fetched once that route is actually navigated to.

```jsx
const Dashboard = lazy(() => import("./Dashboard"));
<Route
  path="/dashboard"
  element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  }
/>;
```

---

## 09. Authentication

**JWT (JSON Web Token)** exists to make authentication **stateless** — instead of the server keeping a database of active sessions and looking one up on every request, it issues a signed token containing the user's identity/claims. Any server holding the signing secret can verify the token wasn't tampered with, without needing to check a database at all. Note "signed" doesn't mean "encrypted" — anyone can decode a JWT's payload and read it; the signature only proves it wasn't altered, so JWTs should never carry secret data (see section 15).

**Access Token vs Refresh Token** exists to balance security against convenience. If you only had one long-lived token, a stolen token would grant access indefinitely; if you only had short-lived tokens, users would need to re-login every few minutes. The compromise: a short-lived **access token** (minutes) is what actually authorizes API calls, while a long-lived **refresh token** is used only to silently mint new access tokens when the old one expires — so a stolen access token has a small blast radius. **Refresh token rotation** goes a step further: every time a refresh token is used, the server issues a brand-new one and invalidates the old one, so if an attacker ever manages to reuse a stolen refresh token, the legitimate user's _next_ refresh attempt will immediately fail and reveal the theft.

**Cookies/Session vs OAuth**: a traditional session keeps the actual user data on the server, giving the client only an opaque session ID — this makes revoking access trivial (just delete the server-side session) at the cost of needing a shared session store (Redis/DB) across your servers. **OAuth** solves a different problem entirely: letting a user log in via a third party (Google, GitHub) without your app ever seeing their password — your app receives a token proving "this third party vouches this is who they say they are."

**Storage: Cookie vs LocalStorage vs SessionStorage** — this table matters because where you store a token directly determines your attack surface:

|                     | Sent to server automatically | Survives tab close | XSS exposure                                 | CSRF exposure                          |
| ------------------- | ---------------------------- | ------------------ | -------------------------------------------- | -------------------------------------- |
| Cookie (`httpOnly`) | Yes                          | Depends on expiry  | Safe — JS can't read it at all               | Vulnerable — needs CSRF token/SameSite |
| LocalStorage        | No                           | Yes                | Vulnerable — any injected script can read it | Safe                                   |
| SessionStorage      | No                           | No (per tab)       | Vulnerable                                   | Safe                                   |

The practical takeaway: an `httpOnly` cookie can't be stolen by a malicious script (XSS) since JavaScript literally cannot read it, but it _is_ automatically attached to every request to that domain, which is what opens the door to CSRF (needing `SameSite`/CSRF-token protection instead). `localStorage` is the reverse trade-off. This is exactly why the recommended practice is `httpOnly`, `Secure`, `SameSite` cookies for auth tokens, never `localStorage` — XSS is generally considered the more dangerous, harder-to-fully-prevent class of vulnerability.

### 🆕 BFF (Backend-for-Frontend) Pattern

The problem this solves: if your Next.js client component holds a raw JWT (even briefly, in memory or a client-readable cookie) to call your APIs directly, that token is exposed to any XSS vulnerability in your frontend. The BFF pattern adds a thin server-side layer — in Next.js, this is Middleware + Route Handlers, both of which run only on the server, never shipped to the browser — that sits between the browser and your real backend APIs. The browser only ever holds an opaque, `httpOnly` session cookie; the actual JWT (or whatever credential your backend needs) stays entirely server-side, attached to outgoing requests by your own Next.js server code, never exposed to client JavaScript at all.

```
Browser  →  Next.js Server (BFF layer: middleware + route handlers)  →  Upstream APIs
         (only an httpOnly session cookie ever reaches the browser)
```

```js
// middleware.ts — runs on the server before the request reaches a page/route
export function middleware(request) {
  const session = request.cookies.get("session")?.value;
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

// app/api/user/route.ts — server-only route handler
export async function GET(request) {
  const token = request.cookies.get("session")?.value; // never exposed to client JS
  const res = await fetch("https://internal-api.com/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Response.json(await res.json());
}
```

This is why the modern recommendation for Next.js apps is: handle JWTs strictly on the server (middleware/route handlers), and never pass them to a client component or store them anywhere client-readable — the BFF layer is what makes that possible without giving up the ability to call authenticated APIs from your pages.

---

## 10. API Handling

**Fetch vs Axios**: `fetch` is built into every browser, but it's deliberately low-level — it doesn't auto-parse JSON, and (surprisingly to many) it does **not** reject on 4xx/5xx responses, only on actual network failure, so you must manually check `res.ok`. `axios` wraps a lot of this: automatic JSON parsing, rejecting on non-2xx by default, and request/response interceptors for things like automatically attaching auth headers to every request.

```js
const res = await fetch(url);
if (!res.ok) throw new Error();
const data = await res.json();

const { data } = await axios.get(url); // auto-parsed, auto-throws on failure
```

**AbortController** solves the "component unmounted before the fetch finished" problem — without it, a `setState` call from a request that resolves after the component is gone either errors or silently does nothing useful; with it, you can actually cancel the in-flight request itself (also useful for cancelling a stale search request when the user types a new character before the old one resolves).

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, [url]);
```

**Retry, Pagination, Infinite Scroll** all address the reality that networks are unreliable and datasets are large. A basic retry strategy backs off exponentially so you're not hammering a struggling server with instant retries.

```js
async function fetchWithRetry(url, retries = 3, delay = 500) {
  try {
    return await fetch(url);
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, retries - 1, delay * 2);
  }
}
```

**Optimistic Updates** exist purely for perceived speed: instead of showing a spinner and waiting for the server to confirm before updating the UI, you update the UI immediately as if the request already succeeded, then quietly roll it back if the request actually fails. React 19's `useOptimistic` hook builds this pattern in natively.

```jsx
const [optimisticTodos, addOptimistic] = useOptimistic(
  todos,
  (state, newTodo) => [...state, newTodo],
);
```

**Caching, Polling, WebSocket, SSE** are different strategies for keeping client data fresh, chosen based on how "live" the data needs to be. **Caching** avoids refetching data you already have. **Polling** repeatedly re-fetches on a timer — simple, but wasteful and never truly real-time. **WebSocket** opens one persistent, full-duplex connection where either side can push data anytime — the right tool when the server needs to proactively push updates (chat). **SSE (Server-Sent Events)** is a simpler one-way alternative — the server streams events to the client over a regular HTTP connection — good for things like live notifications where the client never needs to send data back over that same connection.

**Error Handling, Loading, Skeleton**: every piece of async UI genuinely has three distinct states to handle — loading, error, and success — and skipping any one of them is how you end up with apps that look "broken" (blank screen with no explanation) when a request is slow or fails. A **skeleton** (a gray placeholder shaped like the real content) is generally considered better UX than a spinner because it sets expectations about the shape of the incoming content and feels faster, even when actual load time is identical.

```jsx
if (error) return <ErrorBanner message={error.message} />;
if (isLoading) return <SkeletonCard />;
```

---

## 11. Next.js

Next.js exists because plain React only tells you how to build components — it doesn't decide routing, data fetching, or where rendering happens. Next.js is an opinionated framework layered on top of React that answers all of that, and the **App Router** (Next.js 13+) is the current, actively-developed way of doing so, built specifically around React Server Components. The older **Pages Router** still works and is common in existing codebases, but new projects default to App Router.

### Folder Structure (App Router)

Routing here is **file-system based** — folders under `app/` map directly to URL segments, and specially-named files inside each folder define what renders for that segment.

```
app/
  layout.tsx        # shared shell (persists across navigations within it)
  page.tsx           # route UI for "/"
  loading.tsx        # Suspense fallback shown automatically for this segment
  error.tsx          # error boundary automatically wrapping this segment
  template.tsx       # like layout, but re-mounts (resets state) on every navigation
  dashboard/
    page.tsx         # "/dashboard"
    [id]/page.tsx    # "/dashboard/:id" — Dynamic Route, [id] becomes a URL param
```

### Server Components vs Client Components

This is the single biggest mental shift from older React. In the App Router, **every component is a Server Component by default** — it runs only on the server, can be `async` and fetch data directly (no `useEffect` needed), and crucially, ships **zero JavaScript** to the browser for its own code, since the server already rendered it to HTML. A component only needs to become a **Client Component** (opted in with `'use client'` at the top of the file) if it actually needs interactivity — hooks like `useState`/`useEffect`, event handlers, or browser-only APIs.

```jsx
// Server Component (default) — runs only on server, can be async
async function Page() {
  const data = await db.query("SELECT * FROM posts"); // direct data access, no API layer needed
  return <PostList posts={data} />;
}

// Client Component — needed for interactivity/hooks/browser APIs
("use client");
function LikeButton() {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>{liked ? "❤️" : "🤍"}</button>
  );
}
```

This is directly why RSC reduces bundle size compared to a fully client-rendered app: any component that's purely "fetch some data and display it" never needs to send its logic to the browser at all — only the genuinely interactive leaves of your tree do.

### Server Actions

Before Server Actions, mutating data from a form meant creating a separate API route, then calling it via `fetch` from the client — two files for one operation. A Server Action is a function marked `'use server'` that can be called _directly_ from a form's `action` prop (or from client code), and Next.js handles the network round-trip for you automatically, including re-validating any cached data that depended on it.

```jsx
// app/actions.ts
"use server";
export async function createPost(formData) {
  await db.posts.create({ title: formData.get("title") });
  revalidatePath("/posts"); // tells Next.js "the cached /posts page is now stale, rebuild it"
}

// Usage directly in a form, no separate API route needed
<form action={createPost}>
  <input name="title" />
  <button>Post</button>
</form>;
```

### Middleware

Sometimes you need logic to run _before_ a request even reaches a specific page — checking auth, redirecting based on locale, A/B test bucketing. Middleware runs at the edge, before routing resolves, and can redirect, rewrite, or modify the request/response.

```js
export function middleware(request) {
  if (!request.cookies.get("session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
export const config = { matcher: ["/dashboard/:path*"] }; // only runs for matching paths
```

### Route Handlers

For cases where you genuinely need a traditional REST-style API endpoint (e.g., a webhook target, or an endpoint consumed by a mobile app rather than your own Next.js pages), Route Handlers let you define one per HTTP method inside `app/api/.../route.ts`.

```js
export async function GET() {
  return Response.json(await getPosts());
}
export async function POST(request) {
  const body = await request.json(); /* ... */
}
```

### Metadata, Fonts, Image, Link

These are Next.js's built-in answers to common performance/SEO pain points that plain React leaves entirely up to you. `metadata` auto-injects proper `<head>` tags for SEO. `next/font` self-hosts Google/custom fonts at build time instead of a client-side request to Google's font CDN, eliminating the layout shift/flash that happens while a web font loads. `next/image` automatically resizes, lazy-loads, and serves modern formats for images. `next/link` enables client-side navigation between pages (no full reload) and automatically prefetches the linked page's code when it enters the viewport or is hovered.

```jsx
export const metadata = { title: "My App", description: "..." };

import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import Image from "next/image";
<Image src="/hero.png" width={800} height={400} alt="hero" priority />;

import Link from "next/link";
<Link href="/about">About</Link>;
```

### Caching & Revalidation (Next.js specifics)

Next.js extends the native `fetch` API with caching options that let you choose, per request, which rendering strategy from section 00 you actually want — this is the concrete mechanism behind SSG/ISR/SSR in the App Router.

```jsx
fetch(url, { cache: "force-cache" }); // SSG-like — cache indefinitely until manually revalidated
fetch(url, { next: { revalidate: 60 } }); // ISR — serve cached, regenerate in background every 60s
fetch(url, { cache: "no-store" }); // SSR — always fetch fresh, every single request
```

### Parallel Routes & Intercepting Routes

**Parallel Routes** (`@slot` folders) let you render multiple, independently-loading sections within the same layout at once — like a dashboard where an `@analytics` panel and a `@team` panel each fetch and render on their own timeline, rather than the whole page waiting on the slowest one. **Intercepting Routes** (`(.)folder` syntax) solve the "Instagram photo modal" problem: clicking a photo from a feed opens it in a modal overlay (keeping the feed visible behind it), but if the user refreshes the page while that modal's URL is active, they get the full standalone photo page instead — same URL, two different rendering contexts depending on how you arrived.

### Turbopack, Edge Runtime, Deployment

**Turbopack** is a Rust-based bundler built to replace Webpack in `next dev`/`next build`, offering much faster incremental rebuilds — this matters purely for developer experience (faster feedback loop), not runtime performance for end users. The **Edge Runtime** is a stripped-down JS runtime (no Node.js APIs like `fs`) that lets Middleware and some Route Handlers run at CDN edge locations physically close to the user, reducing latency for things like auth checks. **Deployment** is most seamless on Vercel (Next.js's creator, zero-config), though self-hosting via `next start` or Docker's "standalone" output is fully supported too.

### 🆕 React 19 in Next.js: Forms & Actions Recap

Next.js 15 leans directly into `useActionState` + `useFormStatus` + Server Actions working together — the Server Action does the actual mutation, and `useActionState` on the client wires up its pending state and returned result without any manual `onSubmit`/try-catch plumbing.

```jsx
"use client";
import { useActionState } from "react";
import { createPost } from "./actions"; // Server Action

export default function NewPostForm() {
  const [state, formAction, isPending] = useActionState(createPost, {
    error: null,
  });
  return (
    <form action={formAction}>
      <input name="title" />
      <button disabled={isPending}>{isPending ? "Posting..." : "Post"}</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

## 12. CSS

**Flexbox vs Grid**: both are layout systems, but solve different shapes of problem. Flexbox is fundamentally **one-dimensional** — it's about distributing space along a single row or column (great for navbars, button groups, centering one thing). Grid is fundamentally **two-dimensional** — you define rows and columns together up front, which is the right tool once you're actually laying out a page structure (a full dashboard grid, a photo gallery) rather than a single line of items.

```css
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
```

**Position / Display / Box Model**: `position` decides how an element participates in (or escapes) normal document flow — `relative` shifts it visually without removing it from flow, `absolute` removes it entirely and positions it relative to the nearest positioned ancestor, `fixed` positions relative to the viewport (stays put on scroll), `sticky` behaves like relative until a scroll threshold, then switches to fixed-like behavior. The **box model** describes what actually makes up an element's rendered size: `content` (the actual text/image), wrapped by `padding` (space inside the border), wrapped by `border`, with `margin` outside everything (space between this element and others). The classic beginner confusion — "why is my box bigger than the width I set" — comes from the default `box-sizing: content-box`, where `width` only sets the content area and padding/border add _on top_; `border-box` instead makes `width` include padding and border, so what you set is what you get.

```css
.box {
  box-sizing: border-box;
  padding: 16px;
  border: 1px solid;
  margin: 8px;
}
```

**Specificity** is the rule system CSS uses to decide which of several conflicting rules targeting the same element actually wins — it's not about which rule appears later in the file (that only matters as a tiebreaker between equal specificity), it's a weighted score: inline styles beat IDs, IDs beat classes/attributes/pseudo-classes, and those beat plain element selectors.

```
inline style (1000) > ID (100) > class/attribute/pseudo-class (10) > element (1)
```

**Responsive Design / Media Queries** exist because a fixed layout designed for a desktop screen simply breaks on a phone — media queries let you apply different CSS rules based on conditions like viewport width, letting one stylesheet adapt to many screen sizes.

```css
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
```

**Animations**: `transition` smoothly interpolates a property between two states over time (e.g., a hover effect), while `@keyframes` lets you define a more complex, multi-step animation sequence that can run automatically rather than only in response to a state change.

```css
.box {
  transition: transform 0.3s ease;
}
.box:hover {
  transform: scale(1.05);
}
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**Styling Approaches**: the differences here mostly come down to _when_ the CSS is generated and _how scoped_ it is. Tailwind avoids writing custom CSS almost entirely by giving you small utility classes composed directly in markup — fast to write, no naming decisions, but markup gets verbose. CSS Modules give each file its own automatically-scoped class names, so you write normal CSS without worrying about a class name colliding with one in another file, and it costs nothing at runtime since it's resolved at build time. Styled Components write actual CSS inside your JS, which lets styles react to props dynamically, but that dynamism costs a small runtime overhead. SCSS is just CSS with programming conveniences (variables, nesting, mixins) compiled down to plain CSS ahead of time — no runtime cost, but no dynamic prop-based styling either. BEM isn't a tool at all, just a naming convention (`.block__element--modifier`) for keeping plain CSS class names collision-free and self-documenting without any tooling.

---

## 13. Testing

**Jest / Vitest** are test runners — they discover test files, run them, and report pass/fail. Vitest has increasingly become the default for new projects mainly because it's built to work natively with Vite's fast dev/build pipeline (Jest's config can be slower and more finicky in a Vite-based project).

```jsx
test("adds numbers", () => {
  expect(sum(1, 2)).toBe(3);
});
```

**React Testing Library (RTL)** encodes a specific testing philosophy: test your components the way a real user would interact with them — find things by visible text or accessibility role, click them, and assert on what appears — rather than reaching into component internals (state, props) directly. The reasoning: tests written against internal implementation break every time you refactor _how_ something works, even if _what it does for the user_ hasn't changed; testing through the user-facing behavior avoids that fragility.

```jsx
render(<Button title="Save" />);
expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
fireEvent.click(screen.getByRole("button"));
```

**Cypress / Playwright** step up from component-level testing to true **end-to-end (E2E)** testing — they drive an actual real browser, clicking through your actual running app exactly like a user would, catching integration issues (routing, real network calls, cross-component interactions) that isolated component tests can't. Playwright has gained ground over Cypress mainly by supporting multiple browser engines natively and generally running faster.

**Mocking** replaces a real dependency (an API call, a module) with a fake, controlled version during a test — this is what lets you test "what does my component do when the API returns an error" without actually needing a real failing API to test against.

```js
jest.mock("./api", () => ({
  getUser: jest.fn(() => Promise.resolve({ name: "Ru" })),
}));
```

**Snapshot Testing** takes a "picture" of your rendered output the first time a test runs and saves it; on future runs, it fails if the output differs from that saved snapshot. It's genuinely good at catching _accidental_ UI changes, but it has a real weakness: when a snapshot test fails, the easiest response is often to blindly run "update snapshot" without actually reviewing whether the change was intentional — which quietly defeats the entire point of the test.

**Coverage** measures what percentage of your code actually executed during your test suite (by statement, branch, function, or line). It's a useful smell-detector for completely untested code, but a high coverage number doesn't mean your tests are _good_ — a line can be "covered" by a test that never actually asserts anything meaningful about it.

---

## 14. Accessibility (a11y)

**ARIA (Accessible Rich Internet Applications)** exists to describe the _role_, _state_, and _properties_ of custom UI elements to assistive technology (screen readers), for cases where plain HTML doesn't already convey that meaning on its own — e.g., a `<div>` styled to look like a dropdown has no inherent "this is a dropdown, currently closed" meaning for a screen reader until you add ARIA attributes.

```jsx
<button aria-label="Close menu" aria-expanded={isOpen}>×</button>
<div role="alert">Form submitted successfully</div>
```

The common guidance "no ARIA is better than bad ARIA" exists because incorrect ARIA actively _overrides_ a screen reader's normal (usually correct) interpretation of an element — misusing it can make something less accessible than not touching it at all.

**Semantic HTML** is almost always the better first move before reaching for ARIA, because tags like `<nav>`, `<button>`, and `<main>` already carry built-in meaning, keyboard behavior, and screen-reader announcements for free — a real `<button>` is focusable and triggerable by Enter/Space automatically; a `<div onClick>` styled to look like a button gives you none of that unless you manually re-implement it.

```html
<nav>...</nav>
<main>...</main>
<article>...</article>
<button>...</button>
```

**Keyboard Navigation & Focus** matter because a meaningful portion of users (motor impairments, screen reader users, power users) never touch a mouse at all — every interactive element needs to be reachable and operable via Tab/Enter/Space/Arrow keys alone. A **focus trap** keeps keyboard focus cycling within an open modal instead of tabbing out into the page behind it (which would be confusing since the modal visually blocks that page). `:focus-visible` specifically shows a focus outline only when navigating by keyboard, not on a mouse click — solving the old complaint that focus rings look "ugly" on mouse clicks while still preserving them where they're actually needed.

**Contrast**: WCAG AA requires at least a 4.5:1 contrast ratio between text and its background for normal-sized text (3:1 for large text) — this isn't an arbitrary aesthetic preference, it's the threshold below which text becomes genuinely hard to read for users with low vision or in bright ambient light.

**Screen Readers**: testing with an actual screen reader (VoiceOver on Mac, NVDA on Windows) is the only reliable way to catch accessibility issues that look fine visually but are broken for assistive tech — missing `alt` text, unlabeled form inputs, or landmark regions (`<nav>`, `<main>`) that aren't announced meaningfully as you navigate.

---

## 15. Security

**XSS (Cross-Site Scripting)** happens when an attacker manages to get their own JavaScript to execute in another user's browser session — usually by injecting a `<script>` tag or event handler through unsanitized user input that later gets rendered as raw HTML. React actually protects you from this by default: `{userInput}` is always escaped as plain text, never interpreted as HTML — the danger only appears when you explicitly opt out of that protection.

```jsx
// Dangerous — never do this with unsanitized input
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**CSRF (Cross-Site Request Forgery)** exploits the fact that cookies are sent automatically with every request to their domain — an attacker's malicious site can trigger a request to _your_ app, and if the user's browser still has a valid session cookie for your app, that request goes through with their credentials, even though they never intended it. `SameSite` cookie attributes and CSRF tokens are the standard defenses — both aim to prove a request genuinely originated from your own site's forms/scripts, not a third-party page.

**CSP (Content Security Policy)** is a response header that tells the browser exactly which sources are allowed to execute scripts, load styles, or fetch resources on your page — it's a major defense-in-depth layer against XSS, because even if an attacker manages to inject a script tag, the browser will simply refuse to execute it if its source isn't on the allow-list.

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com
```

**Clickjacking** tricks a user into clicking something they didn't mean to, by layering an invisible iframe of your real site over a decoy UI (e.g., "click here to win a prize" that actually clicks your site's "delete account" button underneath). `X-Frame-Options: DENY` (or the modern CSP `frame-ancestors` directive) tells browsers to refuse to render your page inside any iframe at all, closing off this attack.

**Sanitization** means stripping or escaping dangerous HTML/script content out of user input _before_ rendering or storing it — necessary any time you deliberately render user-generated HTML (like a rich-text comment), since simply trusting the input as-is is exactly how XSS happens.

**HTTPS** encrypts traffic between browser and server, which is non-negotiable for any app handling auth/cookies — without it, session cookies and credentials are readable by anyone on the same network (public wifi, ISP, etc.), and many modern browser APIs (geolocation, service workers) simply refuse to work at all over plain HTTP.

**JWT & Secrets**: because a JWT's payload is only base64-encoded (readable by anyone, not encrypted), it should never contain sensitive data — and signing secrets or API keys must live only on the server, never inside a client bundle or a `NEXT_PUBLIC_` env var, since anything with that prefix is deliberately shipped to the browser and visible to anyone who opens dev tools.

**Rate Limiting** caps how many requests a given IP/user can make in a time window, which is the primary defense against brute-force login attempts and general API abuse — commonly implemented at the edge/middleware layer using something like Redis to track request counts per key.

---

## 16. Frontend System Design

**Folder Structure & Component Design** decisions become genuinely consequential once an app grows past a handful of screens — organizing by feature/domain rather than by file type (see the FSD deep-dive in section 18) is what keeps a large codebase navigable instead of turning into one enormous `components/` folder nobody can find anything in.

**Micro Frontends** apply the same "split a monolith into independently deployable pieces" idea backend teams use for microservices, but to the frontend — different teams own and deploy entirely separate frontend apps (via Module Federation or single-spa) that are composed together into one experience at build or runtime. This mainly makes sense at real organizational scale, where multiple independent teams need to ship on their own schedule without stepping on each other.

**State Strategy** is about recognizing that not all state is the same kind of problem — a piece of state might genuinely be local-component-only, might need to be shared across the client, might really be a cached copy of server data, or might actually belong in the URL (so it's shareable/bookmarkable, like a search filter). Choosing the wrong "home" for a given piece of state — e.g., putting server data in Redux instead of a proper server-cache library — is one of the most common sources of unnecessary complexity in large apps.

**Caching** exists at multiple layers simultaneously in a real app — the browser's own HTTP cache, a CDN caching static assets close to users, Next.js's server-side data cache, and a client library like React Query caching fetched data in memory — and each layer has a different invalidation story, which is why "just add caching" is rarely a one-line fix in practice.

**API Layer**: routing every network call through a dedicated `services/`/`api/` module (instead of calling `fetch` directly inside components) means you have exactly one place to add things like auth headers, retry logic, or error normalization — and one place to update if the backend's URL or auth scheme changes.

**Error Boundary**: React doesn't automatically catch and gracefully handle errors thrown during rendering — by default, an uncaught render error unmounts the _entire_ app. An Error Boundary is a component that specifically catches errors thrown by its children during rendering and shows a fallback UI instead of blanking the whole page — genuinely important at the route or major-section level so one broken widget doesn't take down everything else.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
```

**Logging, Analytics, Monitoring** answer three different questions once your app is in production and you can no longer watch users directly: Sentry/LogRocket answer "what broke, and for whom" (error tracking); Google Analytics/Amplitude/PostHog answer "what are users actually doing" (product analytics); Datadog/New Relic answer "is the app fast and healthy right now" (performance/infra monitoring).

**Feature Flags** let you ship code to production that's turned _off_ for most users, and flip it on gradually (or for specific users/cohorts) without a redeploy — this decouples "deploying code" from "releasing a feature," which makes gradual rollouts and A/B testing possible without risky big-bang releases.

**CDN (Content Delivery Network)**: since network latency is largely a function of physical distance, a CDN caches your static assets (JS, CSS, images) on servers distributed globally, so a user in Mumbai gets served from a nearby edge location instead of your single origin server on the other side of the planet.

---

## 17. Interview Questions (Core Concepts to Explain Out Loud)

- **Why Virtual DOM?** Directly manipulating the real DOM for every small change is slow, because the browser has to re-run layout/paint on real, expensive DOM nodes. React keeps a lightweight in-memory representation instead, computes the _minimal_ set of actual changes needed by diffing old vs. new, and only touches the real DOM for that minimal set.
- **Why React?** It made UI development declarative (describe _what_ the UI should look like for a given state, not the imperative steps to get there), popularized reusable components, and its ecosystem/tooling (plus now first-class server rendering via RSC) has kept it dominant.
- **Fiber**: React's internal reconciliation engine (since React 16) that represents rendering work as a linked list of units that can be paused, resumed, and prioritized — this is the low-level machinery that makes concurrent features like `useTransition` possible; before Fiber, rendering was a single uninterruptible synchronous pass.
- **Hydration**: explained fully in section 00/11 — the short version is "attach interactivity to already-correct server HTML" rather than throwing that HTML away and re-rendering from scratch.
- **Diffing / Reconciliation**: React compares the old and new element trees level-by-level (not a full generic tree-diff, which would be prohibitively slow at O(n³)) — using element _type_ and `key` as heuristics, it achieves an O(n) approximation that's correct for the vast majority of real UI changes.
- **Rules of Hooks**: hooks must be called in the exact same order on every render, which is only possible if you call them unconditionally at the top level — React actually tracks each hook's state by its _call position_ in that order, not by name, so a hook inside an `if` would shift every subsequent hook's position and silently corrupt state.
- **Strict Mode**: a development-only wrapper that deliberately double-invokes render functions and effects, specifically to surface bugs (impure rendering, missing cleanup) that would otherwise only show up unpredictably in production under concurrent rendering.
- **React.memo vs useCallback**: they solve complementary halves of the same problem — `memo` decides whether a component should skip re-rendering based on its props; `useCallback` is what makes a function prop _stable_ enough for that comparison to actually succeed instead of failing every time due to a fresh function reference.
- **Redux vs Context**: Context is built-in and fine for values that rarely change (theme, current user); Redux adds structured actions/reducers, devtools with time-travel debugging, middleware, and — critically — better performance for frequently-changing state, since Context re-renders every consumer on any change while Redux-connected components can subscribe selectively.
- **SSR vs CSR**: SSR trades server compute cost for a faster, SEO-friendly first paint; CSR trades a slower, empty-shell first load for simpler infrastructure (no server rendering needed) and calmer server cost at scale.
- **Next.js rendering choice**: pick based on how often the data changes and whether SEO matters — SSG for rarely-changing public content, ISR for periodically-changing public content, SSR for per-request personalized/dynamic content, CSR for interactive, non-SEO-critical UI like authenticated dashboards.

> Use this section as a talking-points index — pair each bullet with the fuller explanation already given in the relevant numbered section above.

---

## 18. Project Architecture

### Classic Layered Structure

```
src/
  components/   hooks/    pages/     services/
  store/        utils/    types/     styles/
  constants/    middleware/  api/
```

This organizes files **by technical type** — all components together, all hooks together, and so on. It's easy to understand immediately and works fine for small-to-medium apps, but it has a real scaling problem: as the app grows, `components/` becomes a folder with 200 unrelated files, and understanding "everything related to checkout" means hunting across five different top-level folders instead of looking in one place.

### Enterprise Approaches

- **Feature-based**: instead of grouping by type, group by feature (`features/checkout/`, `features/profile/`), with each feature folder owning its own components/hooks/api calls/types internally. This directly fixes the classic-structure problem — everything related to one feature lives together, and deleting a feature is (ideally) deleting one folder.
- **Domain-driven**: structures the frontend to mirror actual business domains (Orders, Inventory, Users) rather than technical features — this tends to fit large organizations where the frontend structure needs to map cleanly onto how the backend/business is already divided into bounded contexts.
- **Monorepo**: keeps multiple related apps/packages (a web app, a mobile app, a shared UI kit, shared utilities) in a single repository, managed by tools like Turborepo/Nx/pnpm workspaces — the appeal is sharing code across apps with atomic commits (a single PR can update the shared button component _and_ every app using it, in sync), instead of coordinating version bumps across separate repos.

### 🆕 Feature-Sliced Design (FSD)

Feature-based organization is a good instinct, but on its own it doesn't stop teams from creating messy, circular dependencies between features (feature A quietly importing something from feature B, which imports back from A). FSD is a **stricter methodology** that adds an explicit hierarchy of layers on top of the feature-folder idea, plus an enforced rule about which layers are allowed to import from which — specifically to prevent that kind of dependency chaos once a codebase gets large enough that no single person can hold the whole dependency graph in their head.

**Layers, ordered top to bottom — each layer may only import from layers strictly below it:**

```
app        — app-wide setup: providers, routing, global styles, entry point
pages      — compositions of widgets/features for a specific route
widgets    — large self-contained UI blocks composed of features/entities (e.g., Header, ProductCard)
features   — user-facing actions/use-cases (e.g., AddToCart, LikePost, LoginForm)
entities   — business domain objects (e.g., User, Product) — their data + basic UI
shared     — reusable, domain-agnostic code (UI kit, API client, utils, config)
```

```
src/
  app/
  pages/
    product-page/
  widgets/
    header/
  features/
    add-to-cart/
      ui/
      model/
      api/
  entities/
    product/
      ui/
      model/
  shared/
    ui/
    api/
    lib/
```

The rule in practice: a `feature` is allowed to use `entities` and `shared`, but is never allowed to import directly from another `feature`, and definitely never from anything above it (`widgets`/`pages`/`app`). This one-way dependency graph is precisely what stops the "everything secretly depends on everything" problem that ad-hoc feature folders don't prevent — which is why FSD has become a de-facto standard for large React/Next.js monorepos and enterprise codebases: every engineer has a predictable, enforced answer to "where does this code belong, and what is it allowed to depend on."

---

## 19. Machine Coding (Practice List)

The value of these isn't memorizing a "correct" solution — it's building the muscle memory for the trade-offs that come up in almost every real interview build:

- **Todo App** — CRUD, filtering, localStorage persistence.
- **Kanban Board** — drag & drop (`react-dnd`/`dnd-kit`), managing column/card state cleanly.
- **File Explorer** — a recursive tree component, expand/collapse state per node.
- **Infinite Scroll** — `IntersectionObserver` combined with pagination.
- **Typeahead / Autocomplete** — debounced search, keyboard navigation, and the ARIA combobox pattern for accessibility.
- **Dashboard** — composing widgets/charts into a responsive grid.
- **Chat App** — WebSocket/SSE, optimistic message sending, auto-scroll-to-bottom behavior.
- **Shopping Cart** — shared/global state, quantity updates, correctly derived totals.
- **Instagram Feed** — infinite scroll + lazy-loaded images + optimistic like/comment UI.
- **Netflix UI** — horizontally-scrolling rows, modal preview on hover.
- **Twitter Clone** — feed, compose flow, optimistic posting, nested replies.
- **Google Keep** — masonry grid layout, drag-to-reorder, color picker, local persistence.

**Tip:** in interviews, narrate your trade-offs out loud as you build (why controlled vs. uncontrolled here, why this data structure, how this would hold up at 10,000 items) — interviewers are generally evaluating your reasoning process more than whether you finish the whole thing.

---

## 20. Best Practices

- **Folder Naming**: pick one casing convention (commonly `kebab-case` for folders, `PascalCase` for component files) and apply it consistently across the whole repo — inconsistency here is a small thing that compounds into real friction as a codebase and team grow.
- **Reusable Components**: design components to vary through props (`variant`, `size`) rather than copy-pasting a near-identical component for every slight visual difference — the latter means every future bug fix has to be applied N times.
- **Error Boundaries**: place them at route or major-widget boundaries specifically so one crashing component degrades gracefully instead of taking down the entire app.
- **Loading States / Empty States**: every piece of async UI genuinely has three states worth designing for — loading, empty (successfully loaded, but there's nothing to show — not an error), and error — and skipping the empty/error cases is one of the most common gaps between a "demo" and a production-ready feature.
- **API Separation**: keep all network calls behind a `services/`/`api/` layer rather than calling `fetch` inline inside components, so there's one place to change if an endpoint or auth scheme changes.
- **Hooks Separation**: pull non-trivial logic out into custom hooks (`useCart`, `useAuth`) so components stay focused on describing UI, not managing complex logic inline.
- **Avoid Inline Functions in Hot Paths**: creating a new function/object literal inline as a prop on every render defeats a memoized child's `React.memo` check, since a fresh reference always looks like "changed props" — `useCallback` or module-level constants avoid that. (The React Compiler, section 06, reduces how often this manual discipline actually matters — but it's still worth understanding why it mattered.)
- **Accessibility & SEO**: build these in from the start rather than retrofitting — semantic HTML/ARIA/metadata decisions are far cheaper to get right upfront than to unwind later across a large codebase.
- **Performance**: measure before optimizing — use the Profiler/Lighthouse to find the actual bottleneck rather than speculatively wrapping everything in `useMemo`, which adds complexity without guaranteed benefit.
- **Code Review Checklist**: naming clarity, no dead code left behind, tests covering the critical paths, basic accessibility considered, no secrets committed, proper error handling present, and no obviously unnecessary re-renders introduced by the change.

---

## Bonus: React Rendering Flow

```
State Change → Render Phase → Diffing → Reconciliation → Commit Phase → Browser Paint
```

The **Render Phase** is where React calls your component functions to build a new element tree — this is deliberately pure and side-effect-free, which is what allows React to pause, throw away, or restart this work mid-way under concurrent rendering, without anything user-visible having happened yet. Diffing/Reconciliation (covered fully in section 17) then figures out the minimal real change needed. The **Commit Phase** is where React finally writes those changes to the actual DOM — this part is synchronous and can't be interrupted, since partially-applied DOM changes would leave the page in a broken visual state.

## Bonus: React Lifecycle (Hooks Mental Model)

```
Mount:   Render → useLayoutEffect → Paint → useEffect
Update:  Render → Cleanup (prev effect) → useLayoutEffect → Paint → useEffect
Unmount: Cleanup
```

The ordering here is the whole point to internalize: `useLayoutEffect` always runs _before_ the browser paints (so DOM measurements never visibly flicker), while `useEffect` always runs _after_ paint (so it never blocks the user from seeing the update) — and on every update after the first, whatever cleanup function you returned from the _previous_ effect run always fires before the new one, ensuring you never accumulate duplicate subscriptions/timers.

## Bonus: Next.js Rendering Decision Tree

```
Need SEO?
├── Yes
│   ├── Data changes rarely       → SSG
│   ├── Data changes periodically → ISR
│   └── Data changes every request→ SSR
└── No → CSR
```

## Bonus: React Performance Decision Tree

```
Slow renders?
├── Expensive calculation?             → useMemo (or let React Compiler handle it)
├── Stable callback needed?            → useCallback (or React Compiler)
├── Component re-renders unnecessarily?→ React.memo
├── Long lists?                        → Virtualization
└── Large bundle?                      → Lazy loading / Code splitting
```

Read this tree as a diagnostic flow, not a checklist to apply everywhere upfront: start from an actual observed slowness (via the Profiler), then match the _specific_ cause to the _specific_ fix — applying all of these preemptively adds real complexity for optimizations you may not even need.
