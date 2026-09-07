function ProductCard({ image, title, price }) {
  return (
    <div className="product-card">
      <img src={image} alt="" />

      <div className="info">
        <h4>{title}</h4>
        <p>₹ {price}</p>
      </div>
    </div>
  );
}

export default ProductCard;