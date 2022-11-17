import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CreateOrderInput = {
  atomicSwapSalt: Scalars['Int'];
  buyerAddress: Scalars['String'];
  buyerTransaction: Scalars['String'];
  productId: Scalars['String'];
  quantity: Scalars['Float'];
};

export type EditProductInput = {
  availableQuantity: Scalars['Int'];
  description?: InputMaybe<Scalars['String']>;
  imageUrl?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  price: Scalars['Float'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addProduct?: Maybe<Product>;
  createOrder?: Maybe<Order>;
  editProduct?: Maybe<Product>;
  signIn?: Maybe<Scalars['String']>;
};


export type MutationAddProductArgs = {
  product: ProductInput;
};


export type MutationCreateOrderArgs = {
  order: CreateOrderInput;
};


export type MutationEditProductArgs = {
  id: Scalars['String'];
  productData: EditProductInput;
};


export type MutationSignInArgs = {
  message: Scalars['String'];
  signature: Scalars['String'];
};

export type Order = {
  __typename?: 'Order';
  amount?: Maybe<Scalars['Float']>;
  buyerAddress?: Maybe<Scalars['String']>;
  buyerTransaction?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  id?: Maybe<Scalars['String']>;
  product?: Maybe<Product>;
  quantity?: Maybe<Scalars['Float']>;
  sellerTransaction?: Maybe<Scalars['String']>;
  status?: Maybe<OrderStatus>;
  updatedAt: Scalars['String'];
};

export type OrderHistoryItem = {
  __typename?: 'OrderHistoryItem';
  timestamp: Scalars['String'];
  totalOrderAmount: Scalars['Float'];
  totalOrders: Scalars['Int'];
};

export enum OrderStatus {
  Complete = 'Complete',
  Pending = 'Pending'
}

export type Product = {
  __typename?: 'Product';
  availableQuantity: Scalars['Int'];
  contractAddress: Scalars['String'];
  createdAt: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  imageUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  price: Scalars['Float'];
  tokenId?: Maybe<Scalars['String']>;
  tokenStandard: TokenStandard;
  updatedAt: Scalars['String'];
};

export type ProductInput = {
  availableQuantity: Scalars['Int'];
  contractAddress: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  imageUrl?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  price: Scalars['Float'];
  tokenId?: InputMaybe<Scalars['String']>;
  tokenStandard: TokenStandard;
};

export type Query = {
  __typename?: 'Query';
  findOrders?: Maybe<Array<Maybe<Order>>>;
  findProducts?: Maybe<Array<Maybe<Product>>>;
  getOrder?: Maybe<Order>;
  getProduct?: Maybe<Product>;
  getStoreMetrics?: Maybe<StoreMetrics>;
};


export type QueryFindOrdersArgs = {
  productId?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<OrderStatus>;
};


export type QueryGetOrderArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type QueryGetProductArgs = {
  id?: InputMaybe<Scalars['String']>;
};

export type StoreMetrics = {
  __typename?: 'StoreMetrics';
  orderHistory: Array<OrderHistoryItem>;
  totalOrderAmount: Scalars['Float'];
  totalOrders: Scalars['Int'];
  totalProducts: Scalars['Int'];
};


export type StoreMetricsOrderHistoryArgs = {
  numDays?: InputMaybe<Scalars['Int']>;
};

export enum TokenStandard {
  Erc20 = 'Erc20',
  Erc721 = 'Erc721'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CreateOrderInput: CreateOrderInput;
  EditProductInput: EditProductInput;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  Order: ResolverTypeWrapper<Order>;
  OrderHistoryItem: ResolverTypeWrapper<OrderHistoryItem>;
  OrderStatus: OrderStatus;
  Product: ResolverTypeWrapper<Product>;
  ProductInput: ProductInput;
  Query: ResolverTypeWrapper<{}>;
  StoreMetrics: ResolverTypeWrapper<StoreMetrics>;
  String: ResolverTypeWrapper<Scalars['String']>;
  TokenStandard: TokenStandard;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  CreateOrderInput: CreateOrderInput;
  EditProductInput: EditProductInput;
  Float: Scalars['Float'];
  Int: Scalars['Int'];
  Mutation: {};
  Order: Order;
  OrderHistoryItem: OrderHistoryItem;
  Product: Product;
  ProductInput: ProductInput;
  Query: {};
  StoreMetrics: StoreMetrics;
  String: Scalars['String'];
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addProduct?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<MutationAddProductArgs, 'product'>>;
  createOrder?: Resolver<Maybe<ResolversTypes['Order']>, ParentType, ContextType, RequireFields<MutationCreateOrderArgs, 'order'>>;
  editProduct?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType, RequireFields<MutationEditProductArgs, 'id' | 'productData'>>;
  signIn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationSignInArgs, 'message' | 'signature'>>;
};

export type OrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['Order'] = ResolversParentTypes['Order']> = {
  amount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  buyerAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  buyerTransaction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  product?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sellerTransaction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['OrderStatus']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrderHistoryItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrderHistoryItem'] = ResolversParentTypes['OrderHistoryItem']> = {
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalOrderAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalOrders?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductResolvers<ContextType = any, ParentType extends ResolversParentTypes['Product'] = ResolversParentTypes['Product']> = {
  availableQuantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  contractAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  tokenId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tokenStandard?: Resolver<ResolversTypes['TokenStandard'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  findOrders?: Resolver<Maybe<Array<Maybe<ResolversTypes['Order']>>>, ParentType, ContextType, Partial<QueryFindOrdersArgs>>;
  findProducts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Product']>>>, ParentType, ContextType>;
  getOrder?: Resolver<Maybe<ResolversTypes['Order']>, ParentType, ContextType, Partial<QueryGetOrderArgs>>;
  getProduct?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType, Partial<QueryGetProductArgs>>;
  getStoreMetrics?: Resolver<Maybe<ResolversTypes['StoreMetrics']>, ParentType, ContextType>;
};

export type StoreMetricsResolvers<ContextType = any, ParentType extends ResolversParentTypes['StoreMetrics'] = ResolversParentTypes['StoreMetrics']> = {
  orderHistory?: Resolver<Array<ResolversTypes['OrderHistoryItem']>, ParentType, ContextType, Partial<StoreMetricsOrderHistoryArgs>>;
  totalOrderAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalOrders?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalProducts?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Mutation?: MutationResolvers<ContextType>;
  Order?: OrderResolvers<ContextType>;
  OrderHistoryItem?: OrderHistoryItemResolvers<ContextType>;
  Product?: ProductResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  StoreMetrics?: StoreMetricsResolvers<ContextType>;
};

