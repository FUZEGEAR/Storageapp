import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './logo.png'; 

const InventoryManagementApp = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [parts, setParts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', composition: {} });
  const [newPart, setNewPart] = useState({ name: '', stock: 0 });
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({ partId: '', quantity: 0, pricePerUnit: 0, isWithTax: false });
  const [newComposition, setNewComposition] = useState({ partId: '', quantity: 0 });
  const [newPartToProduct, setNewPartToProduct] = useState({ productId: '', partId: '', quantity: 0 });
  const [soldProducts, setSoldProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [newSale, setNewSale] = useState({ 
    productId: '', 
    quantity: 0, 
    price: 0,
    clientFirstName: '',
    clientLastName: '',
    clientCompany: '',
    clientBillingAddress: '',
    clientPhone: '',
    remark: ''
  });
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [editingRemark, setEditingRemark] = useState('');
  const [assemblableProducts, setAssemblableProducts] = useState([]);
  



  // ... (autres fonctions restent inchangées)


  useEffect(() => {
    setProducts([{ id: 1, name: 'Kit custom FX3', stock: 5, composition: { 'Plaque V-mount': 1, 'D-TAP': 1, 'Vis 1/4-20': 6, 'Vis tête fraisée M4x16': 4 } }]);
    setParts([
      { id: 1, name: 'Plaque V-mount', stock: 10, averagePrice: 0 },
      { id: 2, name: 'D-TAP', stock: 15, averagePrice: 0 },
      { id: 3, name: 'Vis 1/4-20', stock: 100, averagePrice: 0 },
      { id: 4, name: 'Vis tête fraisée M4x16', stock: 80, averagePrice: 0 }
    ]);
  }, []);

  useEffect(() => {
    updateAssemblableProducts();
    // eslint-disable-next-line
  }, [products, parts]);

   const updateAssemblableProducts = () => {
    const assemblable = products.filter(product => {
      return Object.entries(product.composition).every(([partName, quantity]) => {
        const part = parts.find(p => p.name === partName);
        return part && part.stock >= quantity;
      });
    });
    setAssemblableProducts(assemblable);
  };

  const handleEditProductComposition = (productId) => {
    setEditingProductId(productId);
  };

  const handleRemovePartFromComposition = (productId, partName) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        const { [partName]: removedPart, ...restComposition } = product.composition;
        return { ...product, composition: restComposition };
      }
      return product;
    }));
  };

  const handleQuantityChange = (productId, change) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        const newStock = Math.max(0, product.stock + change);
        if (change < 0) {
          // Désassemblage : on augmente le stock des pièces
          setParts(parts.map(part => {
            const returnedQuantity = (product.composition[part.name] || 0) * Math.abs(change);
            return {
              ...part,
              stock: part.stock + returnedQuantity
            };
          }));
        } else if (change > 0) {
          // Assemblage : on vérifie d'abord si on a assez de pièces
          const canAssemble = Object.entries(product.composition).every(([partName, quantity]) => {
            const part = parts.find(p => p.name === partName);
            return part && part.stock >= quantity * change;
          });
          if (!canAssemble) {
            alert("Stock insuffisant pour assembler plus de produits");
            return product;
          }
          // Si on a assez de pièces, on met à jour leur stock
          setParts(parts.map(part => {
            const usedQuantity = (product.composition[part.name] || 0) * change;
            return {
              ...part,
              stock: part.stock - usedQuantity
            };
          }));
        }
        return { ...product, stock: newStock };
      }
      return product;
    }));
  };

  const renderProductCompositionEditor = (product) => {
    return (
      <div className="composition-editor">
        <h4>Composition de {product.name}</h4>
        <div>
          {Object.entries(product.composition).map(([partName, quantity]) => (
            <div key={partName}>
              {partName}: {quantity}
              <button onClick={() => handleRemovePartFromComposition(product.id, partName)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
        <div>
          <select
            value={newComposition.partId}
            onChange={(e) => setNewComposition({ ...newComposition, partId: e.target.value })}
          >
            <option value="">Sélectionner une pièce</option>
            {parts.map(part => (
              <option key={part.id} value={part.id}>{part.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={newComposition.quantity}
            onChange={(e) => setNewComposition({ ...newComposition, quantity: parseInt(e.target.value) })}
            placeholder="Quantité"
          />
          <button onClick={handleAddPartToComposition}>Ajouter à la composition</button>
        </div>
        <button onClick={() => setEditingProductId(null)}>Terminer l'édition</button>
      </div>
    );
  };



  const handleAddPartToComposition = () => {
    if (editingProductId && newComposition.partId && newComposition.quantity > 0) {
      setProducts(products.map(product => {
        if (product.id === editingProductId) {
          const part = parts.find(p => p.id === parseInt(newComposition.partId));
          const updatedComposition = {
            ...product.composition,
            [part.name]: (product.composition[part.name] || 0) + parseInt(newComposition.quantity)
          };
          return { ...product, composition: updatedComposition };
        }
        return product;
      }));
      setNewComposition({ partId: '', quantity: 0 });
    }
  };

  const handleAddProduct = () => {
    if (Object.keys(newProduct.composition).length === 0) {
      alert("Veuillez ajouter au moins une pièce à la composition du produit.");
      return;
    }
    setProducts([...products, { ...newProduct, id: products.length + 1, stock: 0 }]);
    setNewProduct({ name: '', composition: {} });
  };

  const handleAddComposition = () => {
    const part = parts.find(p => p.id === parseInt(newComposition.partId));
    if (part && newComposition.quantity > 0) {
      setNewProduct({
        ...newProduct,
        composition: {
          ...newProduct.composition,
          [part.name]: (newProduct.composition[part.name] || 0) + parseInt(newComposition.quantity)
        }
      });
      setNewComposition({ partId: '', quantity: 0 });
    }
  };

  const handleAddPartToProduct = () => {
    const product = products.find(p => p.id === parseInt(newPartToProduct.productId));
    const part = parts.find(p => p.id === parseInt(newPartToProduct.partId));
    
    if (product && part) {
      const updatedComposition = {
        ...product.composition,
        [part.name]: (product.composition[part.name] || 0) + parseInt(newPartToProduct.quantity)
      };
      
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, composition: updatedComposition } : p
      ));
      
      setNewPartToProduct({ productId: '', partId: '', quantity: 0 });
    } else {
      alert("Veuillez sélectionner un produit et une pièce valides.");
    }
  };

  
  const handleRemoveComposition = (partName) => {
    const updatedComposition = { ...newProduct.composition };
    delete updatedComposition[partName];
    setNewProduct({ ...newProduct, composition: updatedComposition });
  };

  const handleAddPart = () => {
    setParts([...parts, { ...newPart, id: parts.length + 1, averagePrice: 0 }]);
    setNewPart({ name: '', stock: 0 });
  };

  const handleUpdatePartStock = (id, newStock) => {
    setParts(parts.map(part => part.id === id ? { ...part, stock: parseInt(newStock) } : part));
  };
  // eslint-disable-next-line
  const handleAssembleProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    const canAssemble = Object.entries(product.composition).every(([partName, quantity]) => {
      const part = parts.find(p => p.name === partName);
      return part && part.stock >= quantity;
    });
    if (canAssemble) {
      setParts(parts.map(part => product.composition[part.name] ? { ...part, stock: part.stock - product.composition[part.name] } : part));
      setProducts(products.map(p => p.id === productId ? { ...p, stock: p.stock + 1 } : p));
    } else {
      alert("Stock insuffisant pour assembler ce produit");
    }
  };

  const handleAddOrder = () => {
    const part = parts.find(p => p.id === parseInt(newOrder.partId));
    if (part) {
      const priceWithoutTax = newOrder.isWithTax ? newOrder.pricePerUnit / 1.2 : newOrder.pricePerUnit;
      const newOrderWithTotal = { 
        ...newOrder, 
        id: orders.length + 1, 
        partName: part.name, 
        pricePerUnit: priceWithoutTax,
        total: newOrder.quantity * priceWithoutTax,
        received: false
      };
      setOrders([...orders, newOrderWithTotal]);
      setNewOrder({ partId: '', quantity: 0, pricePerUnit: 0, isWithTax: false });
    }
  };

  const handleDeleteOrder = (orderId) => {
    setOrders(orders.filter(order => order.id !== orderId));
  };

  const handleReceiveOrder = (orderId) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const newReceivedStatus = !order.received;
        if (newReceivedStatus) {
          // Si on marque comme reçu, on met à jour le stock et le prix moyen
          setParts(parts.map(part => {
            if (part.name === order.partName) {
              const newStock = part.stock + order.quantity;
              const newTotalValue = part.stock * part.averagePrice + order.total;
              return { ...part, stock: newStock, averagePrice: newTotalValue / newStock };
            }
            return part;
          }));
        } else {
          // Si on démarque comme reçu, on retire du stock et ajuste le prix moyen
          setParts(parts.map(part => {
            if (part.name === order.partName) {
              const newStock = Math.max(0, part.stock - order.quantity);
              const newTotalValue = Math.max(0, part.stock * part.averagePrice - order.total);
              return { ...part, stock: newStock, averagePrice: newStock > 0 ? newTotalValue / newStock : 0 };
            }
            return part;
          }));
        }
        return { ...order, received: newReceivedStatus };
      }
      return order;
    }));
  };

  const handleSellProduct = () => {
    const product = products.find(p => p.id === parseInt(newSale.productId));
    if (product && newSale.quantity > 0 && product.stock >= newSale.quantity) {
      // Mise à jour du stock du produit
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, stock: p.stock - newSale.quantity } : p
      ));

      // Ajout de la vente
      setSoldProducts([...soldProducts, {
        id: soldProducts.length + 1,
        productName: product.name,
        quantity: newSale.quantity,
        price: newSale.price,
        total: newSale.quantity * newSale.price,
        date: new Date().toISOString(),
        clientFirstName: newSale.clientFirstName,
        clientLastName: newSale.clientLastName,
        clientCompany: newSale.clientCompany,
        clientBillingAddress: newSale.clientBillingAddress,
        clientPhone: newSale.clientPhone,
        remark: newSale.remark
      }]);

      setNewSale({ 
        productId: '', 
        quantity: 0, 
        price: 0,
        clientFirstName: '',
        clientLastName: '',
        clientCompany: '',
        clientBillingAddress: '',
        clientPhone: '',
        remark: ''
      });
    } else {
      alert("Vente impossible. Vérifiez le produit sélectionné et la quantité disponible.");
    }
  };

  const handleDeleteSale = (saleId) => {
    const saleToDelete = soldProducts.find(sale => sale.id === saleId);
    if (saleToDelete) {
      // Remettre le stock du produit
      setProducts(products.map(p => 
        p.name === saleToDelete.productName ? { ...p, stock: p.stock + saleToDelete.quantity } : p
      ));

      // Supprimer la vente
      setSoldProducts(soldProducts.filter(sale => sale.id !== saleId));
    }
  };

  const handleEditRemark = (saleId) => {
    setEditingSaleId(saleId);
    const sale = soldProducts.find(s => s.id === saleId);
    setEditingRemark(sale.remark);
  };

  const handleSaveRemark = () => {
    setSoldProducts(soldProducts.map(sale => 
      sale.id === editingSaleId ? { ...sale, remark: editingRemark } : sale
    ));
    setEditingSaleId(null);
    setEditingRemark('');
  };


  const calculateTotalWithTax = (total) => total * 1.2;
  const totalAssembledProducts = products.reduce((sum, product) => sum + product.stock, 0);

 

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <img src={logo} alt="Logo de l'entreprise" className="app-logo" />
        </div>
        <h1 className="app-title">Gestion des stocks</h1>
      </header>
      <nav className="app-nav">
        {['inventory', 'products', 'restock', 'sales'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`tab-button ${activeTab === tab ? 'tab-button-active' : 'tab-button-inactive'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
      
      
      <div className="mb-4">
        <strong>Total des produits en stock :</strong> 
        <span className="badge badge-success ml-2">{totalAssembledProducts}</span>
      </div>
      {activeTab === 'inventory' && (
        <div>
          <h2 className="section-title">Inventaire des pièces</h2>
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Nom</th>
                  <th>Stock</th>
                  <th>Prix moyen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {parts.map((part) => (
                  <tr key={part.id} className="table-row">
                    <td className="table-cell">{part.name}</td>
                    <td className="table-cell">
                      <input 
                        type="number" 
                        value={part.stock} 
                        onChange={(e) => handleUpdatePartStock(part.id, e.target.value)} 
                        className="input-field"
                      />
                    </td>
                    <td className="table-cell">{part.averagePrice.toFixed(2)} € HT</td>
                    <td className="table-cell">
                      <button onClick={() => handleUpdatePartStock(part.id, part.stock + 1)} className="button button-success mr-2">+</button>
                      <button onClick={() => handleUpdatePartStock(part.id, Math.max(0, part.stock - 1))} className="button button-danger">-</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="section-title">Ajouter une nouvelle pièce</h3>
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Nom de la pièce" 
              value={newPart.name} 
              onChange={(e) => setNewPart({ ...newPart, name: e.target.value })} 
              className="input-field mr-2"
            />
            <input 
              type="number" 
              placeholder="Stock initial" 
              value={newPart.stock} 
              onChange={(e) => setNewPart({ ...newPart, stock: parseInt(e.target.value) })} 
              className="input-field mr-2"
            />
            <button onClick={handleAddPart} className="button button-primary">Ajouter</button>
          </div>
        </div>
      )}
      
      {activeTab === 'products' && (
        
  <div>
    <h2 className="section-title">Produits assemblés</h2>
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th>Nom</th>
            <th>Stock</th>
            <th>Composition</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {products.map((product) => (
            <tr key={product.id} className="table-row">
              <td className="table-cell">{product.name}</td>
              <td className="table-cell">
              <button 
                          onClick={() => handleQuantityChange(product.id, -1)} 
                          className="button button-small"
                          disabled={product.stock <= 0}
                        >
                          -
                        </button>
                        {product.stock}
                        <button 
                          onClick={() => handleQuantityChange(product.id, 1)} 
                          className="button button-small"
                        >
                          +
                        </button>
              </td>
              <td className="table-cell">
                {Object.entries(product.composition).map(([part, quantity]) => (
                  <div key={part}>{part}: {quantity}</div>
                ))}
              </td>
              <td className="table-cell">
                <button onClick={() => handleEditProductComposition(product.id)} className="button button-primary">
                  Éditer la composition
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {editingProductId && renderProductCompositionEditor(products.find(p => p.id === editingProductId))}

    <h3 className="section-title mt-4">Produits assemblables</h3>
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th>Nom</th>
            <th>Composition</th>
            <th>Quantité assemblable</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {assemblableProducts.map((product) => {
            const assembleQuantity = Math.min(
              ...Object.entries(product.composition).map(([partName, quantity]) => {
                const part = parts.find((p) => p.name === partName);
                return Math.floor(part.stock / quantity);
              })
            );
            return (
              <tr key={product.id} className="table-row">
                <td className="table-cell">{product.name}</td>
                <td className="table-cell">
                  {Object.entries(product.composition).map(([part, quantity]) => (
                    <div key={part}>{part}: {quantity}</div>
                  ))}
                </td>
                <td className="table-cell">{assembleQuantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    <h3 className="section-title">Ajouter une pièce à un produit existant</h3>
    <div className="form-group">
      <select 
        value={newPartToProduct.productId} 
        onChange={(e) => setNewPartToProduct({ ...newPartToProduct, productId: e.target.value })} 
        className="input-field mr-2"
      >
        <option value="">Sélectionner un produit</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>{product.name}</option>
        ))}
      </select>

      <select 
        value={newPartToProduct.partId} 
        onChange={(e) => setNewPartToProduct({ ...newPartToProduct, partId: e.target.value })} 
        className="input-field mr-2"
      >
        <option value="">Sélectionner une pièce</option>
        {parts.map((part) => (
          <option key={part.id} value={part.id}>{part.name}</option>
        ))}
      </select>

      <input 
        type="number" 
        placeholder="Quantité" 
        value={newPartToProduct.quantity} 
        onChange={(e) => setNewPartToProduct({ ...newPartToProduct, quantity: parseInt(e.target.value) })} 
        className="input-field mr-2"
      />

      <button onClick={handleAddPartToProduct} className="button button-primary">
        Ajouter la pièce au produit
      </button>
    </div>

    <h3 className="section-title">Ajouter un nouveau produit</h3>
    <div className="form-group">
      <input 
        type="text" 
        placeholder="Nom du produit" 
        value={newProduct.name} 
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
        className="input-field mr-2"
      />
    </div>

    <h4 className="section-title">Composition du produit</h4>
    <div className="form-group">
      <select 
        value={newComposition.partId} 
        onChange={(e) => setNewComposition({ ...newComposition, partId: e.target.value })} 
        className="input-field mr-2"
      >
        <option value="">Sélectionner une pièce</option>
        {parts.map((part) => (
          <option key={part.id} value={part.id}>{part.name}</option>
        ))}
      </select>

      <input 
        type="number" 
        placeholder="Quantité" 
        value={newComposition.quantity} 
        onChange={(e) => setNewComposition({ ...newComposition, quantity: parseInt(e.target.value) })} 
        className="input-field mr-2"
      />

      <button onClick={handleAddComposition} className="button button-success">
        Ajouter à la composition
      </button>
    </div>

    <div className="mt-2">
      <h5 className="section-title">Composition actuelle :</h5>
      {Object.entries(newProduct.composition).map(([partName, quantity]) => (
        <div key={partName} className="flex items-center mb-2">
          <span className="mr-2">{partName}: {quantity}</span>
          <button onClick={() => handleRemoveComposition(partName)} className="button button-danger">
            Retirer
          </button>
        </div>
      ))}
    </div>

    <button onClick={handleAddProduct} className="button button-primary mt-2">
      Ajouter le produit
    </button>
  </div>
)}

      {activeTab === 'restock' && (
        <div>
           <h2 className="section-title">Réapprovisionnement</h2>
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Pièce</th>
                  <th>Quantité</th>
                  <th>Prix unitaire HT</th>
                  <th>Total HT</th>
                  <th>Total TTC</th>
                  <th>Reçu</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {orders.map((order) => (
                  <tr key={order.id} className={`table-row ${order.received ? 'bg-green-100' : ''}`}>
                    <td className="table-cell">{order.partName}</td>
                    <td className="table-cell">{order.quantity}</td>
                    <td className="table-cell">{order.pricePerUnit.toFixed(2)} €</td>
                    <td className="table-cell">{order.total.toFixed(2)} €</td>
                    <td className="table-cell">{calculateTotalWithTax(order.total).toFixed(2)} €</td>
                    <td className="table-cell">
                      <input 
                        type="checkbox" 
                        checked={order.received} 
                        onChange={() => handleReceiveOrder(order.id)} 
                        className="checkbox"
                      />
                    </td>
                    <td className="table-cell">
                      <button 
                        onClick={() => handleDeleteOrder(order.id)} 
                        className="button button-danger" 
                        disabled={order.received}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       <h3 className="section-title">Ajouter une commande</h3>
       <div className="form-group">
         <select 
           value={newOrder.partId} 
           onChange={(e) => setNewOrder({ ...newOrder, partId: e.target.value })} 
           className="input-field mr-2"
         >
           <option value="">Sélectionner une pièce</option>
           {parts.map(part => <option key={part.id} value={part.id}>{part.name}</option>)}
         </select>
         <input 
           type="number" 
           placeholder="Quantité" 
           value={newOrder.quantity} 
           onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })} 
           className="input-field mr-2"
         />
         <input 
           type="number" 
           step="0.01" 
           placeholder="Prix unitaire" 
           value={newOrder.pricePerUnit} 
           onChange={(e) => setNewOrder({ ...newOrder, pricePerUnit: parseFloat(e.target.value) })} 
           className="input-field mr-2"
         />
         <select 
           value={newOrder.isWithTax ? "TTC" : "HT"} 
           onChange={(e) => setNewOrder({ ...newOrder, isWithTax: e.target.value === "TTC" })} 
           className="input-field mr-2"
         >
           <option value="HT">HT</option>
           <option value="TTC">TTC</option>
         </select>
         <button onClick={handleAddOrder} className="button button-primary">Ajouter la commande</button>
       </div>
     </div>
   )} 

{activeTab === 'sales' && (
        <div>
          <h2 className="section-title">Produits vendus</h2>
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                  <th>Date de vente</th>
                  <th>Client</th>
                  <th>Entreprise</th>
                  <th>Adresse de facturation</th>
                  <th>Téléphone</th>
                  <th>Remarque</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {soldProducts.map((sale) => (
                  <tr key={sale.id} className="table-row">
                    <td className="table-cell">{sale.productName}</td>
                    <td className="table-cell">{sale.quantity}</td>
                    <td className="table-cell">{sale.price.toFixed(2)} €</td>
                    <td className="table-cell">{sale.total.toFixed(2)} €</td>
                    <td className="table-cell">{new Date(sale.date).toLocaleString()}</td>
                    <td className="table-cell">{`${sale.clientFirstName} ${sale.clientLastName}`}</td>
                    <td className="table-cell">{sale.clientCompany}</td>
                    <td className="table-cell">{sale.clientBillingAddress}</td>
                    <td className="table-cell">{sale.clientPhone}</td>
                    <td className="table-cell">
                      {editingSaleId === sale.id ? (
                        <input 
                          type="text" 
                          value={editingRemark} 
                          onChange={(e) => setEditingRemark(e.target.value)}
                          className="input-field mr-2"
                        />
                      ) : (
                        sale.remark
                      )}
                    </td>
                    <td className="table-cell">
                      {editingSaleId === sale.id ? (
                        <button onClick={handleSaveRemark} className="button button-primary mr-2">Sauvegarder</button>
                      ) : (
                        <button onClick={() => handleEditRemark(sale.id)} className="button button-secondary mr-2">Modifier remarque</button>
                      )}
                      <button onClick={() => handleDeleteSale(sale.id)} className="button button-danger">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="section-title">Enregistrer une vente</h3>
          <div className="form-group">
            <select 
              value={newSale.productId} 
              onChange={(e) => setNewSale({ ...newSale, productId: e.target.value })} 
              className="input-field mr-2"
            >
              <option value="">Sélectionner un produit</option>
              {products.map(product => <option key={product.id} value={product.id}>{product.name} (Stock: {product.stock})</option>)}
            </select>
            <input 
              type="number" 
              placeholder="Quantité" 
              value={newSale.quantity} 
              onChange={(e) => setNewSale({ ...newSale, quantity: parseInt(e.target.value) })} 
              className="input-field mr-2"
            />
            <input 
              type="number" 
              step="0.01" 
              placeholder="Prix unitaire" 
              value={newSale.price} 
              onChange={(e) => setNewSale({ ...newSale, price: parseFloat(e.target.value) })} 
              className="input-field mr-2"
            />
          </div>
          <div className="form-group mt-2">
            <input 
              type="text" 
              placeholder="Prénom du client" 
              value={newSale.clientFirstName} 
              onChange={(e) => setNewSale({ ...newSale, clientFirstName: e.target.value })} 
              className="input-field mr-2"
            />
            <input 
              type="text" 
              placeholder="Nom du client" 
              value={newSale.clientLastName} 
              onChange={(e) => setNewSale({ ...newSale, clientLastName: e.target.value })} 
              className="input-field mr-2"
            />
            <input 
              type="tel" 
              placeholder="Téléphone du client" 
              value={newSale.clientPhone} 
              onChange={(e) => setNewSale({ ...newSale, clientPhone: e.target.value })} 
              className="input-field mr-2"
            />
          </div>
          <div className="form-group mt-2">
            <input 
              type="text" 
              placeholder="Entreprise du client" 
              value={newSale.clientCompany} 
              onChange={(e) => setNewSale({ ...newSale, clientCompany: e.target.value })} 
              className="input-field mr-2"
            />
          </div>
          <div className="form-group mt-2">
            <textarea 
              placeholder="Adresse de facturation" 
              value={newSale.clientBillingAddress} 
              onChange={(e) => setNewSale({ ...newSale, clientBillingAddress: e.target.value })} 
              className="input-field w-full mr-2"
              rows="3"
            />
          </div>
          <div className="form-group mt-2">
            <textarea 
              placeholder="Remarque" 
              value={newSale.remark} 
              onChange={(e) => setNewSale({ ...newSale, remark: e.target.value })} 
              className="input-field w-full mr-2"
              rows="3"
            />
          </div>
          <button onClick={handleSellProduct} className="button button-primary mt-2">Enregistrer la vente</button>
        </div>
      )}
    </div>
  );
  

};

export default InventoryManagementApp;