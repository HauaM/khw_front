# React 개발 베스트 프랙티스 가이드 (For Codex)

> 이 문서는 React 공식 문서(react.dev)를 기반으로 작성된 최신 베스트 프랙티스입니다.
> Codex가 React 코드를 생성할 때 참고해야 할 핵심 원칙과 패턴을 담고 있습니다.

---

## 목차

1. [Hooks 규칙과 패턴](#1-hooks-규칙과-패턴)
2. [상태 관리 전략](#2-상태-관리-전략)
3. [컴포넌트 설계 패턴](#3-컴포넌트-설계-패턴)
4. [성능 최적화](#4-성능-최적화)
5. [React 19 / Server Components](#5-react-19--server-components)
6. [커스텀 훅 작성 가이드](#6-커스텀-훅-작성-가이드)
7. [일반적인 안티패턴](#7-일반적인-안티패턴)

---

## 1. Hooks 규칙과 패턴

### 1.1 Hook 호출 규칙 (필수)

```javascript
// ✅ 올바른 패턴: 컴포넌트 최상위에서 Hook 호출
function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  // ...
}

// ✅ 올바른 패턴: 커스텀 Hook 최상위에서 Hook 호출
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  // ...
}
```

```javascript
// ❌ 잘못된 패턴: 조건문 안에서 Hook 호출
if (isLoggedIn) {
  useEffect(() => {
    fetchUserData();
  }, []);
}

// ✅ 올바른 패턴: Hook 내부에서 조건 처리
useEffect(() => {
  if (isLoggedIn) {
    fetchUserData();
  }
}, [isLoggedIn]);
```

### 1.2 useState 베스트 프랙티스

```javascript
// ✅ 함수형 업데이트 사용 (이전 상태에 의존할 때)
const [count, setCount] = useState(0);
setCount(c => c + 1); // 이전 상태 기반 업데이트

// ✅ 객체 상태 업데이트 시 스프레드 연산자 사용
const [user, setUser] = useState({ name: '', email: '' });
setUser(prev => ({ ...prev, name: 'John' }));

// ✅ 복잡한 초기값은 초기화 함수 사용
const [data, setData] = useState(() => {
  return computeExpensiveInitialValue();
});
```

### 1.3 useEffect 베스트 프랙티스

```javascript
// ✅ 모든 의존성 명시 + 클린업 함수 구현
function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    // 클린업: 언마운트 또는 의존성 변경 시 실행
    return () => connection.disconnect();
  }, [serverUrl, roomId]); // 모든 반응형 값 포함
}

// ✅ 헬퍼 함수는 Effect 내부에서 정의
function ChatRoom({ roomId }) {
  useEffect(() => {
    // Effect 내부에 함수 정의 → useCallback 불필요
    function createOptions() {
      return {
        serverUrl: 'https://localhost:1234',
        roomId: roomId
      };
    }

    const options = createOptions();
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // roomId만 의존성으로 필요
}
```

```javascript
// ✅ 별개의 관심사는 별개의 Effect로 분리
function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  // Effect 1: 채팅 연결 관리
  useEffect(() => {
    const connection = createConnection({ serverUrl, roomId });
    connection.connect();
    return () => connection.disconnect();
  }, [serverUrl, roomId]);

  // Effect 2: 분석 이벤트 전송
  useEffect(() => {
    post('/analytics/event', { eventName: 'visit_chat', roomId });
  }, [roomId]);
}
```

```javascript
// ✅ 비동기 데이터 페칭 시 race condition 방지
useEffect(() => {
  let ignore = false;
  
  async function fetchData() {
    const result = await fetchSomething(id);
    if (!ignore) {
      setData(result);
    }
  }
  
  fetchData();
  return () => { ignore = true; };
}, [id]);
```

---

## 2. 상태 관리 전략

### 2.1 useReducer로 복잡한 상태 관리

```javascript
// ✅ 복잡한 상태 로직은 reducer로 분리
function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [...tasks, {
        id: action.id,
        text: action.text,
        done: false
      }];
    }
    case 'changed': {
      return tasks.map(t => {
        if (t.id === action.task.id) {
          return action.task;
        }
        return t;
      });
    }
    case 'deleted': {
      return tasks.filter(t => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

function TaskApp() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  
  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text
    });
  }
  // ...
}
```

### 2.2 Context + Reducer 패턴 (전역 상태 관리)

```javascript
// TasksContext.js - 상태와 dispatch를 위한 별도 Context
import { createContext, useContext, useReducer } from 'react';

const TasksContext = createContext(null);
const TasksDispatchContext = createContext(null);

// Provider 컴포넌트
export function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  return (
    <TasksContext value={tasks}>
      <TasksDispatchContext value={dispatch}>
        {children}
      </TasksDispatchContext>
    </TasksContext>
  );
}

// 커스텀 훅으로 Context 소비 간소화
export function useTasks() {
  return useContext(TasksContext);
}

export function useTasksDispatch() {
  return useContext(TasksDispatchContext);
}

function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added':
      return [...tasks, { id: action.id, text: action.text, done: false }];
    case 'changed':
      return tasks.map(t => t.id === action.task.id ? action.task : t);
    case 'deleted':
      return tasks.filter(t => t.id !== action.id);
    default:
      throw Error('Unknown action: ' + action.type);
  }
}
```

```javascript
// 컴포넌트에서 사용
function TaskList() {
  const tasks = useTasks();
  const dispatch = useTasksDispatch();
  
  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <Task task={task} />
        </li>
      ))}
    </ul>
  );
}

// App에서 Provider로 감싸기
function App() {
  return (
    <TasksProvider>
      <h1>Tasks</h1>
      <AddTask />
      <TaskList />
    </TasksProvider>
  );
}
```

---

## 3. 컴포넌트 설계 패턴

### 3.1 Props를 통한 데이터 흐름

```javascript
// ✅ 단방향 데이터 흐름 유지
function Parent() {
  const [value, setValue] = useState('');
  
  return (
    <Child 
      value={value} 
      onChange={setValue} 
    />
  );
}

function Child({ value, onChange }) {
  return (
    <input 
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  );
}
```

### 3.2 컴포넌트 합성 (Composition)

```javascript
// ✅ children을 활용한 유연한 컴포넌트
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

// 사용
<Card title="User Profile">
  <Avatar />
  <UserInfo />
</Card>
```

### 3.3 제어 컴포넌트 vs 비제어 컴포넌트

```javascript
// ✅ 제어 컴포넌트 (권장): React가 상태 관리
function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <input 
      value={value} 
      onChange={e => setValue(e.target.value)} 
    />
  );
}

// 비제어 컴포넌트: DOM이 상태 관리 (특수한 경우에만)
function UncontrolledInput() {
  const inputRef = useRef(null);
  
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  
  return <input ref={inputRef} />;
}
```

---

## 4. 성능 최적화

### 4.1 memo로 불필요한 리렌더링 방지

```javascript
import { memo } from 'react';

// ✅ props가 변경되지 않으면 리렌더링 스킵
const ExpensiveList = memo(function ExpensiveList({ items }) {
  console.log('Rendering list...');
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
});
```

### 4.2 useMemo로 계산 결과 캐싱

```javascript
import { useMemo } from 'react';

function TodoList({ todos, tab }) {
  // ✅ todos나 tab이 변경될 때만 재계산
  const visibleTodos = useMemo(
    () => filterTodos(todos, tab),
    [todos, tab]
  );

  return (
    <ul>
      {visibleTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### 4.3 useCallback으로 함수 참조 안정화

```javascript
import { useCallback, memo } from 'react';

function ProductPage({ productId, referrer }) {
  // ✅ productId, referrer가 같으면 동일한 함수 참조 유지
  const handleSubmit = useCallback((orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]);

  return <ShippingForm onSubmit={handleSubmit} />;
}

// memo와 함께 사용해야 효과 있음
const ShippingForm = memo(function ShippingForm({ onSubmit }) {
  // ...
});
```

### 4.4 useCallback 최적화 팁

```javascript
// ✅ 업데이터 함수 사용으로 의존성 제거
function TodoList() {
  const [todos, setTodos] = useState([]);

  const handleAddTodo = useCallback((text) => {
    const newTodo = { id: nextId++, text };
    // todos를 의존성에서 제거 가능
    setTodos(todos => [...todos, newTodo]);
  }, []); // 빈 의존성 배열
  
  // ...
}
```

### 4.5 Context 최적화

```javascript
import { useState, useCallback, useMemo } from 'react';

function MyApp() {
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ 함수를 useCallback으로 메모이제이션
  const login = useCallback((response) => {
    storeCredentials(response.credentials);
    setCurrentUser(response.user);
  }, []);

  // ✅ Context 값을 useMemo로 메모이제이션
  const contextValue = useMemo(() => ({
    currentUser,
    login
  }), [currentUser, login]);

  return (
    <AuthContext value={contextValue}>
      <Page />
    </AuthContext>
  );
}
```

### 4.6 성능 최적화 적용 기준

```javascript
// ⚠️ 모든 곳에 memo/useMemo/useCallback 사용하지 말 것!
// 다음 경우에만 적용:

// 1. 비용이 큰 계산
const expensiveResult = useMemo(() => {
  return heavyComputation(data); // 수백 ms 이상 소요
}, [data]);

// 2. memo된 자식 컴포넌트에 전달되는 props
const MemoizedChild = memo(Child);
const handler = useCallback(() => {}, []);
<MemoizedChild onClick={handler} />

// 3. 다른 Hook의 의존성으로 사용되는 값
const options = useMemo(() => ({ roomId }), [roomId]);
useEffect(() => {
  // options 사용
}, [options]);
```

---

## 5. React 19 / Server Components

### 5.1 Server Components 기본

```javascript
// Server Component (기본값) - 'use client' 없음
// 서버에서만 실행, 클라이언트 번들에 포함 안됨
import db from './database';

async function Note({ id }) {
  // 서버에서 직접 데이터베이스 접근 가능
  const note = await db.notes.get(id);
  
  return (
    <div>
      <Author id={note.authorId} />
      <p>{note.content}</p>
    </div>
  );
}

async function Author({ id }) {
  const author = await db.authors.get(id);
  return <span>By: {author.name}</span>;
}
```

### 5.2 Client Components

```javascript
// Client Component - 인터랙션이 필요한 경우
'use client';

import { useState } from 'react';

export default function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);
  
  return (
    <>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={() => setCount(c => c - 1)}>-1</button>
    </>
  );
}
```

### 5.3 Server에서 Client로 Promise 전달

```javascript
// Server Component
import db from './database';
import { Suspense } from 'react';
import Comments from './Comments';

async function Page({ id }) {
  // 중요 데이터는 await
  const note = await db.notes.get(id);
  
  // 덜 중요한 데이터는 Promise로 전달 (스트리밍)
  const commentsPromise = db.comments.get(note.id);
  
  return (
    <div>
      {note.content}
      <Suspense fallback={<p>Loading Comments...</p>}>
        <Comments commentsPromise={commentsPromise} />
      </Suspense>
    </div>
  );
}
```

```javascript
// Client Component - use Hook으로 Promise 소비
'use client';

import { use } from 'react';

function Comments({ commentsPromise }) {
  // 서버에서 시작된 Promise를 클라이언트에서 소비
  const comments = use(commentsPromise);
  
  return comments.map(comment => <p key={comment.id}>{comment.text}</p>);
}
```

### 5.4 use Hook 활용

```javascript
'use client';

import { use } from 'react';

function MessageComponent({ messagePromise }) {
  // Promise 값 읽기 - Suspense와 함께 작동
  const message = use(messagePromise);
  
  // Context 값 읽기 - 조건부로 호출 가능
  const theme = use(ThemeContext);
  
  return <p style={{ color: theme.color }}>{message}</p>;
}
```

### 5.5 Server Functions (Server Actions)

```javascript
// Server Component에서 Server Function 정의
import Button from './Button';

function EmptyNote() {
  async function createNoteAction() {
    'use server';
    await db.notes.create();
  }

  return <Button onClick={createNoteAction} />;
}
```

```javascript
// 별도 파일로 분리 (권장)
// actions.js
'use server';

export async function updateName(formData) {
  const name = formData.get('name');
  await db.users.update({ name });
  return { success: true };
}
```

### 5.6 useActionState (React 19)

```javascript
'use client';

import { useActionState } from 'react';
import { updateName } from './actions';

function UpdateName() {
  const [state, submitAction, isPending] = useActionState(
    updateName, 
    { error: null }
  );

  return (
    <form action={submitAction}>
      <input type="text" name="name" disabled={isPending} />
      {state.error && <span>Failed: {state.error}</span>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
    </form>
  );
}
```

### 5.7 useTransition으로 Actions 처리

```javascript
import { useState, useTransition } from 'react';

function UpdateName() {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const error = await updateName(name);
      if (error) {
        setError(error);
        return;
      }
      redirect('/success');
    });
  };

  return (
    <div>
      <input 
        value={name} 
        onChange={e => setName(e.target.value)} 
      />
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

---

## 6. 커스텀 훅 작성 가이드

### 6.1 커스텀 훅 기본 패턴

```javascript
// ✅ useOnlineStatus - 네트워크 상태 감지
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// 사용
function StatusBar() {
  const isOnline = useOnlineStatus();
  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}
```

### 6.2 데이터 페칭 훅

```javascript
// useSelectOptions - 선택 옵션 데이터 페칭
import { useState, useEffect } from 'react';

export function useSelectOptions(url) {
  const [list, setList] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  
  useEffect(() => {
    if (url === null) return;

    let ignore = false;
    
    fetchData(url).then(result => {
      if (!ignore) {
        setList(result);
        setSelectedId(result[0]?.id ?? '');
      }
    });
    
    return () => { ignore = true; };
  }, [url]);
  
  return [list, selectedId, setSelectedId];
}

// 사용
function Page() {
  const [planets, planetId, setPlanetId] = useSelectOptions('/planets');
  const [places, placeId, setPlaceId] = useSelectOptions(
    planetId ? `/planets/${planetId}/places` : null
  );
  // ...
}
```

### 6.3 인터벌 훅

```javascript
// useInterval - setInterval 추상화
import { useEffect, useRef } from 'react';

export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  
  // 최신 콜백 저장
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// 사용
function Counter() {
  const [count, setCount] = useState(0);
  
  useInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return <h1>Count: {count}</h1>;
}
```

### 6.4 연결 관리 훅

```javascript
// useChatRoom - 채팅방 연결 관리
import { useEffect } from 'react';

export function useChatRoom({ serverUrl, roomId, onMessage }) {
  useEffect(() => {
    const connection = createConnection({ serverUrl, roomId });
    
    connection.connect();
    connection.on('message', onMessage);
    
    return () => connection.disconnect();
  }, [roomId, serverUrl, onMessage]);
}

// 사용
function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');
  
  useChatRoom({
    roomId,
    serverUrl,
    onMessage: (msg) => showNotification('New message: ' + msg)
  });
  
  return <h1>Welcome to {roomId}!</h1>;
}
```

### 6.5 IntersectionObserver 훅

```javascript
// useIntersectionObserver - 요소 가시성 감지
import { useState, useEffect } from 'react';

export function useIntersectionObserver(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 1.0, ...options }
    );
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options.threshold, options.root, options.rootMargin]);

  return isIntersecting;
}

// 사용
function Box() {
  const ref = useRef(null);
  const isVisible = useIntersectionObserver(ref);
  
  return (
    <div ref={ref}>
      {isVisible ? 'Visible!' : 'Not visible'}
    </div>
  );
}
```

---

## 7. 일반적인 안티패턴

### 7.1 ❌ 조건부 Hook 호출

```javascript
// ❌ 절대 금지
function Component({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // Error!
  }
}

// ✅ 올바른 방법
function Component({ condition }) {
  const [state, setState] = useState(0);
  
  if (!condition) {
    return null;
  }
  // state 사용
}
```

### 7.2 ❌ useEffect에서 무한 루프

```javascript
// ❌ 무한 루프 발생
useEffect(() => {
  setCount(count + 1); // 상태 변경 → 리렌더 → Effect 실행 → 반복
});

// ✅ 의존성 배열 지정
useEffect(() => {
  // 마운트 시 한 번만 실행
}, []);

// ✅ 또는 조건부 실행
useEffect(() => {
  if (shouldUpdate) {
    setCount(c => c + 1);
  }
}, [shouldUpdate]);
```

### 7.3 ❌ 객체/배열을 의존성에 직접 사용

```javascript
// ❌ 매 렌더마다 새 객체 → Effect 무한 실행
function ChatRoom({ roomId }) {
  const options = { serverUrl: 'localhost', roomId }; // 매번 새 객체
  
  useEffect(() => {
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [options]); // 매번 다른 참조!
}

// ✅ useMemo로 안정화
function ChatRoom({ roomId }) {
  const options = useMemo(() => ({
    serverUrl: 'localhost',
    roomId
  }), [roomId]);
  
  useEffect(() => {
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [options]);
}

// ✅ 또는 Effect 내부에서 객체 생성
function ChatRoom({ roomId }) {
  useEffect(() => {
    const options = { serverUrl: 'localhost', roomId };
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // 원시값만 의존성으로
}
```

### 7.4 ❌ 불필요한 최적화

```javascript
// ❌ 과도한 최적화 - 모든 곳에 memo/useMemo/useCallback
const SimpleComponent = memo(function SimpleComponent({ name }) {
  return <span>{name}</span>; // 단순 렌더링에 memo 불필요
});

const value = useMemo(() => a + b, [a, b]); // 단순 연산에 useMemo 불필요

// ✅ 실제로 비용이 클 때만 최적화
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // 수천 개 아이템 렌더링 등 비용이 큰 경우
});

const filtered = useMemo(() => {
  return hugeArray.filter(/* 복잡한 필터링 */);
}, [hugeArray, filterCriteria]);
```

### 7.5 ❌ Props로 전달된 함수를 useCallback 없이 memo 컴포넌트에 전달

```javascript
// ❌ memo 무력화
function Parent() {
  function handleClick() { // 매 렌더마다 새 함수
    console.log('clicked');
  }
  
  return <MemoizedChild onClick={handleClick} />;
}

const MemoizedChild = memo(Child);

// ✅ useCallback으로 함수 참조 안정화
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <MemoizedChild onClick={handleClick} />;
}
```

---

## 부록: 빠른 참조

### Hook 선택 가이드

| 상황 | 사용할 Hook |
|------|-------------|
| 컴포넌트 상태 관리 | `useState` |
| 복잡한 상태 로직 | `useReducer` |
| 전역 데이터 접근 | `useContext` |
| Side Effect 처리 | `useEffect` |
| DOM 요소 참조 | `useRef` |
| 값 변경 추적 (렌더 없이) | `useRef` |
| 비용 큰 계산 캐싱 | `useMemo` |
| 콜백 함수 캐싱 | `useCallback` |
| Promise/Context 읽기 | `use` (React 19) |
| 폼 제출 상태 | `useActionState` (React 19) |
| 비동기 전환 | `useTransition` |

### 의존성 배열 규칙

```javascript
// 빈 배열: 마운트 시 1회 실행
useEffect(() => {}, []);

// 의존성 포함: 해당 값 변경 시 실행
useEffect(() => {}, [dep1, dep2]);

// 배열 없음: 매 렌더마다 실행 (보통 잘못된 패턴)
useEffect(() => {}); // ⚠️ 주의

// 의존성에 포함해야 하는 것:
// - props
// - state
// - Effect 내부에서 사용하는 모든 반응형 값

// 의존성에서 제외 가능한 것:
// - 상수 (컴포넌트 외부 정의)
// - ref.current
// - setState 함수, dispatch 함수
```

---

*이 문서는 React 공식 문서(react.dev)를 기반으로 작성되었습니다.*
*최종 업데이트: 2025년*