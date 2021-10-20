# angular-rxjs-grail

>Forked from https://github.com/DeborahK/Angular-RxJS course repo.

Demo project demonstrating RxJS and Observable patterns within an Angular application. This approach is different to using the `@ngrx` package commonly used in Angular projects. Which gives us a store, actions, effects, reducer etc. Instead the following pattern of Observable actions and services is used to create a _reactive_ application without a _Store_:

> Actions: Creating an action stream using a `BehaviorSubject` and calling `.next` is similar to dispatching an action in NgRx:

```JavaScript
  // Action stream
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  onSelected(userName: string): void {
    this.categorySelectedSubject.next(category);
  }

```

> Selecting data: Instead of using NgRx selectors or effects, state is queried directly from the service and subscribed to in the component with `combineLatest`. 


```JavaScript
  // Merge Data stream with Action stream
  // To filter to the selected category
  products$ = combineLatest([
    this.productService.productsWithCRUD$,
    this.categorySelectedAction$
  ])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product =>
          selectedCategoryId ? product.categoryId === selectedCategoryId : true
        )),
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

```


> Querying data: Alternatively to NgRx effects$, Observable services and data from other Observables
are combined to provide the component with an Observable to subscribe to.

```JavaScript
  // Combine products with categories
  // Map to the revised shape.
  // Be sure to specify the type to ensure after the map that it knows the correct type
  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price * 1.5,
        category: categories.find(c => product.categoryId === c.id).name,
        searchKey: [product.productName]
      }) as Product)
    ),
    shareReplay(1)
  );

```


# Hot vs Cold Observables

Hot observables can produce events in the absence of observers, whereas cold observables don’t become active until they have a subscription. A result of this is that hot streams will often have much longer lifespans than their cold counterparts. Whereas a cold stream will shut down when the subscriber shuts down, a hot one can continue running after the end of a subscription.

# Subjects

> An RxJS Subject is a special type of Observable that allows values to be multicasted to many Observers.

Subject: 
> A Subject is like an Observable, but can multicast to many Observers. Subjects are like EventEmitters: they maintain a registry of many listeners.

A Subject sends data to subscribed observers. _Any previously_ emitted data is not sent to new observers.


BehaviorSubject:
> BehaviorSubject stores the latest value emitted to its consumers, and whenever a new Observer subscribes, it will immediately receive the “current value”.

```
const subject = new BehaviorSubject(0); // 0 is the initial value

```


ReplaySubject:
> A ReplaySubject is similar to a BehaviorSubject in that it can send old values to new subscribers, but it can also record a part of the Observable execution.

```
const subject = new ReplaySubject(2); // buffer 2 values for new subscribers

```

AsyncSubject:
> A AsyncSubject will emit the last value to observers when the sequence is completed.

```
const subject = new AsyncSubject();

```


# Stackblitz
Stackblitz Demo: https://stackblitz.com/edit/angular-todos-deborahk?file=src%2Fapp%2Fapp.component.ts

# RxJS Tutorials
> Some youtube tutorials on RxJS principles and operators.

 - Map operators: https://www.youtube.com/watch?v=lM16-E-uCWc
 - Promises vs Observables: https://www.youtube.com/watch?v=GSI7iyK_ju4&ab_channel=NeverBenBetter


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).




