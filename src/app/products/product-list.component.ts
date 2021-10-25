import { Component, ChangeDetectionStrategy } from "@angular/core";

import {
  combineLatest,
  BehaviorSubject,
  EMPTY,
  Subject,
  fromEvent,
  of,
} from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  map,
  switchMap,
  tap,
} from "rxjs/operators";

import { ProductService } from "./product.service";
import { ProductCategoryService } from "../product-categories/product-category.service";
import { Product } from "./product";

@Component({
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = "Product List";
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  // Action stream
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  private productSearchSubject = new Subject<string>();
  productSearchAction$ = this.productSearchSubject.asObservable();

  // Merge Data stream with Action stream
  // To filter to the selected category
  products$ = combineLatest([
    this.productService.productsWithCRUD$,
    this.categorySelectedAction$,
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.filter((product) =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
      )
    ),
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  // products search stream
  productsFiltered$ = combineLatest([
    this.productService.productsWithCRUD$,
    this.productSearchAction$,
  ]).pipe(
    // debounce search stream
    debounceTime(200),
    distinctUntilChanged(),
    map(([products, searchQuery]) =>
      searchQuery ? products.filter((product) =>
        product.productName
          .toLocaleLowerCase()
          .includes(searchQuery.toLocaleLowerCase())
      ) : undefined,
    ),
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  // Categories for drop down list
  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  // Combine the streams for the view
  vm$ = combineLatest([this.products$, this.categories$]).pipe(
    map(([products, categories]) => ({ products, categories }))
  );

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}

  onAdd(): void {
    this.productService.addProduct();
  }

  onDelete(product: Product): void {
    this.productService.deleteProduct(product);
  }

  onRefresh(): void {
    this.productService.refreshData();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }

  onUpdate(product: Product): void {
    this.productService.updateProduct(product);
  }

  onSearch(query: string): void {
    this.productSearchSubject.next(query);
  }
}
