# APM

>Forked from https://github.com/DeborahK/Angular-RxJS course repo.

Demo project demonstrating RxJS and Observables patterns within an Angular application. This approach is different to using the `NgRx` package commonly used in Angular projects. Which gives us a store, actions, effects, reducer etc. Instead the following pattern of Observable actions and services to create a _reactive_ application:

> Actions: Creating an action stream using a `BehaviorSubject` and calling `.next` is similar to dispatching an action in NgRx:

```JavaScript
  // Action stream
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  onSelected(userName: string): void {
    this.categorySelectedSubject.next(category);
  }

```

> Selecting data: Instead of using NgRx selectors, state is queried directly from the service and subscribed to in the component with `combineLatest`. 


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




