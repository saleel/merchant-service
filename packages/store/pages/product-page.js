import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import { TokenStandard } from '../common/constants';
import { ZkopruContext } from '../context/zkopru-context';

const getProductQuery = gql`
  query getProduct($id: String!) {
    product: getProduct(id: $id) {
      id
      name
      description
      price
      availableQuantity
      contractAddress
      tokenStandard
      tokenId
      imageUrl
    }
  }
`;

const createOrderQuery = gql`
  mutation createOrder($orderInput: CreateOrderInput!) {
    createOrder(order: $orderInput) {
      id
      buyerTransactionHash
      sellerTransactionHash
      status
    }
  }
`;

function ProductPage() {
  const [quantity, setQuantity] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const { id } = useParams();
  const { isInitialized, generateSwapTransaction } = React.useContext(ZkopruContext);

  const [createOrderMutation] = useMutation(createOrderQuery);

  const { loading, data = {} } = useQuery(getProductQuery, {
    variables: { id },
  });
  const { product = {} } = data;
  const isNFT = product?.tokenStandard === TokenStandard.ERC721;

  React.useEffect(() => {
    if (isNFT) {
      setQuantity(1);
    }
  }, [product]);

  async function onSubmit(e) {
    e.preventDefault();

    if (!isInitialized) {
      // eslint-disable-next-line no-alert
      alert('Please connect to Zkopru');
      return;
    }

    try {
      setIsLoading(true);
      const { customerTransaction, swapSalt } = await generateSwapTransaction({
        product,
        quantity,
      });

      const createdOrder = await createOrderMutation({
        variables: {
          orderInput: {
            productId: product.id,
            quantity,
            buyerAddress: process.env.MERCHANT_ADDRESS,
            buyerTransaction: customerTransaction,
            atomicSwapSalt: swapSalt,
          },
        },
      });

      console.log(createdOrder);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(`Error ocurred while creating tx: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page product-page">

      <div className="page-title">
        Product - {product.name}
      </div>

      <div className="product-page__container">
        <div className={`product-page__image ${loading ? 'loading' : ''}`}>
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} />
          )}
        </div>

        {loading ? (
          <div className="product-page__details loading" />
        ) : (
          <div className={`product-page__details ${loading ? 'loading' : ''}`}>
            <h2 className="product-page__name">
              {product.name}
            </h2>
            <div className="product-page__description">
              {product.description}
            </div>

            <div className="product-page__label">Contract</div>
            <div className="product-page__value">{product.tokenStandard?.toUpperCase()} - {product.contractAddress}</div>

            {isNFT ? (
              <>
                <div className="product-page__label">Token Id</div>
                <div className="product-page__value">{product.tokenId}</div>
              </>
            ) : (
              <>
                <div className="product-page__label">Available Quantity</div>
                <div className="product-page__value">{product.availableQuantity}</div>
              </>
            )}

            <div className="product-page__label">Price</div>
            <div className="product-page__value">
              <span className="product-page__unit">Ξ</span> {product.price}
            </div>
            <hr />

            <form onSubmit={onSubmit}>
              <div className="product-page__quantity">

                {!isNFT && (
                <div>
                  <div className="product-page__label">Required Quantity</div>
                  <input
                    type="number"
                    className="product-page__input"
                    placeholder="Quantity"
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    max={product.availableQuantity}
                  />
                </div>
                )}

                <div>
                  <div className="product-page__label">Total</div>
                  <div className="product-page__value mt-4">Ξ {product.price * quantity}</div>
                </div>
              </div>

              <button
                type="submit"
                className={`product-page__purchase-button + ${isLoading ? 'product-page__purchase-button--loading' : ''}`}
                disabled={loading}
              >
                <span />
                {!isLoading && 'Purchase'}
              </button>
            </form>

          </div>
        )}
      </div>

    </div>
  );
}

export default ProductPage;
