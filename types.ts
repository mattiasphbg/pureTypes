/*

1. DeepReadonly<T> - Recursive Mapped Types

DeepReadonly<T> is a type transformer - it takes any type (interface, type alias, etc.) and automatically converts it to a readonly version. You don't need to modify your original interface at all!

It's like having a safety net that prevents you from accidentally breaking your data!


Const make so you cant redeclare the object, but you can modify the properties of the object.

const user = {
  name: "John",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Anytown"
  },
  hobbies: ["reading", "traveling"]
};

 ❌ This won't work - can't reassign the entire object
 user = { name: "Jane" };

 ✅ But these WILL work - you can still mutate the contents!
user.name = "Jane";                    // ✅ Works!
user.age = 25;                         // ✅ Works!
user.address.street = "456 Oak Ave";   // ✅ Works!
user.hobbies.push("coding");           // ✅ Works!
user.hobbies[0] = "writing";   





readonly makes so you cant modify the properties of the object.


const readonlyUser: DeepReadonly<typeof user> = user;

 ❌ None of these will work - TypeScript will error!
   readonlyUser.name = "Jane";                    // Error!
   readonlyUser.age = 25;                         // Error!
   readonlyUser.address.street = "456 Oak Ave";   // Error!
   readonlyUser.hobbies.push("coding");           // Error!
   readonlyUser.hobbies[0] = "writing";           // Error!



  const is about reference immutability, while DeepReadonly is about value immutability. They work together perfectly - you typically use both

*/
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};

type TestObject = {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  hobbies: string[];
  great: () => string;
};

type DeepReadonlyTest = DeepReadonly<TestObject>;

/*

  2. Args<T> - Extract Function Arguments using infer


 Args<T> is indeed a fast way to extract all the parameter types from a function and turn them into a tuple type. It's like having TypeScript automatically generate the parameter types for you.

Args<T> is there to extract and validate the arguments that a function expects. It tells you:
- What arguments are allowed
- What types they should be
- In what order they should be passed
*/

type Args<T> = T extends (...args: infer P) => any ? P : never;

type FunctionWithArgs = (name: string, age: number, isActive: boolean) => void;
type FunctionWithoutArgs = () => string;
type NotAFunction = string;

type ArgsTest1 = Args<FunctionWithArgs>;
type ArgsTest2 = Args<FunctionWithoutArgs>;
type ArgsTest3 = Args<NotAFunction>;

/* 

3. UnionToIntersection<T> - Convert Union to Intersection

The type system ensures that the result has every property from every type in the original union, creating one "super type" that combines everything.

It's like taking three different blueprints and merging them into one blueprint that has all the features from all three!


Union Type (|) - "OR"
type Union = A | B | C;
Means: "This can be A OR B OR C"

type Intersection = A & B & C;

Means: "This must be A AND B AND C at the same time"


You discovered the most important rule of UnionToIntersection:

✅ Works great when properties don't conflict -> if A and B have different properties, then it will merge them into one type

❌ Creates never when properties conflict -> if A and B have the same property with different types, then it will create never

 

🎯 Design your types to avoid conflicts -> if A and B have the same property, then you can use UnionToIntersection to merge them into one type


*/

type UnionToIntersectionHelper<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type UnionToIntersection<T> = UnionToIntersectionHelper<T>;

type ObjectA = { a: string; common: number };
type ObjectB = { b: boolean; common: string };
type ObjectC = { c: number[] };

type UnionType = ObjectA | ObjectB | ObjectC;
// This means: "An object that is ObjectA OR ObjectB OR ObjectC"

type IntersectionType = UnionToIntersection<UnionType>;
// This means: "An object that is ObjectA AND ObjectB AND ObjectC at the same time"

/*
 4. BONUS: Additional Advanced Type Utilities

*/

type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

/*
  DeepPartial makes ALL properties optional, so you can create objects with only the fields you want to provide.


 x§ DeepPartial<T> is a type transformer - it takes any type (interface, type alias, etc.) and automatically converts it to a partial version. You don't need to modify your original interface at all!
*/
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

/*
  PickFunctions<T> is a type transformer - it takes any type (interface, type alias, etc.) and automatically picks all the function properties. You don't need to modify your original interface at all!
*/
type PickFunctions<T> = Pick<T, FunctionPropertyNames<T>>;

type PickNonFunctions<T> = Pick<T, NonFunctionPropertyNames<T>>;

/*
5. ADVANCED: Conditional Type Utilities
*/

// This checks if T is a union type
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true; // This checks if T is a union type

// This checks if T is never
type IsNever<T> = [T] extends [never] ? true : false;

// This checks if T is any
type IsAny<T> = 0 extends 1 & T ? true : false;

// This checks if T is unknown
type IsUnknown<T> = IsAny<T> extends true
  ? false
  : unknown extends T
  ? true
  : false;

/*
6. RECURSIVE TYPE UTILITIES
*/

type Flatten<T> = T extends (infer U)[]
  ? U extends any[]
    ? Flatten<U>
    : U
  : T;

type Paths<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends object
    ? T[K] extends any[]
      ? K
      : K | `${K}.${Paths<T[K]>}`
    : K
  : never;

/*
7. UTILITY TYPE TESTS
*/

type ComplexObject = {
  id: number;
  user: {
    name: string;
    profile: {
      avatar: string;
      settings: {
        theme: "light" | "dark";
        notifications: boolean;
      };
    };
  };
  posts: Array<{
    title: string;
    content: string;
    tags: string[];
  }>;
  getFullName: () => string;
  isActive: boolean;
};

type ComplexReadonly = DeepReadonly<ComplexObject>;

type ComplexPartial = DeepPartial<ComplexObject>;

type ComplexFunctions = PickFunctions<ComplexObject>;
type ComplexNonFunctions = PickNonFunctions<ComplexObject>;

type ComplexPaths = Paths<ComplexObject>;

export type {
  DeepReadonly,
  Args,
  UnionToIntersection,
  ReturnType,
  DeepPartial,
  FunctionPropertyNames,
  NonFunctionPropertyNames,
  PickFunctions,
  PickNonFunctions,
  IsUnion,
  IsNever,
  IsAny,
  IsUnknown,
  Flatten,
  Paths,
  // test types
  TestObject,
  DeepReadonlyTest,
  FunctionWithArgs,
  ArgsTest1,
  ArgsTest2,
  ArgsTest3,
  ObjectA,
  ObjectB,
  ObjectC,
  UnionType,
  IntersectionType,
  ComplexObject,
  ComplexReadonly,
  ComplexPartial,
  ComplexFunctions,
  ComplexNonFunctions,
  ComplexPaths,
};
