import re

def main():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Extract header: from start to <section class="hero-section">
    header_match = re.search(r'(.*?)(<section class="hero-section">)', html, re.DOTALL)
    header = header_match.group(1) if header_match else ""

    # Extract footer: from <!-- ===== SUBSCRIPTION FOOTER SECTION START ===== --> to end
    footer_match = re.search(r'(<!-- ===== SUBSCRIPTION FOOTER SECTION START ===== -->.*)', html, re.DOTALL)
    footer = footer_match.group(1) if footer_match else ""

    # Extract cards
    bestseller_match = re.search(r'<div class="bestseller-slider"[^>]*>(.*?)</div>\n\s*<button class="arrow right"', html, re.DOTALL)
    if bestseller_match:
        slider_content = bestseller_match.group(1)
        cards_raw = slider_content.split('<!-- CARD')
        cards = []
        for c in cards_raw[1:]:
            card_html = '<!-- CARD' + c
            # Remove any trailing spaces/newlines
            cards.append(card_html.rstrip())
    else:
        print("Could not find bestseller slider")
        return
        
    print(f"Found {len(cards)} cards")

    def create_page(title, filename):
        breadcrumb_title = title.lower()
        
        # Indent cards for nice formatting
        cards_html = '\n'.join('        ' + c for c in cards)
        
        main_content = f"""
  <!-- COLLECTION PAGE HEADER -->
  <section class="collection-header-section">
    <a href="index.html" class="back-link">
      <div class="icon-circle"><i class="fa-solid fa-arrow-left"></i></div>
      Back to home
    </a>
    <h1>{title} <span>({len(cards)})</span></h1>
    <p>Unlike activities such as running or jogging, using a cross trainer puts less stress on your joints, making it a popular choice for people with joint issues or those seeking a low-impact exercise option.</p>
  </section>

  <!-- COLLECTION MAIN -->
  <section class="collection-main-layout">
    <!-- SIDEBAR -->
    <div class="collection-sidebar">
      <h2 class="sidebar-title">Filters</h2>
      
      <div class="filter-group">
        <div class="filter-group-title">
          AVAILABILITY <span>-</span>
        </div>
        <div class="filter-reset">
          <span>0 selected</span>
          <a href="#">Reset</a>
        </div>
        <div class="filter-item">
          <label><input type="checkbox"> In stock</label>
          <span>({len(cards)})</span>
        </div>
        <div class="filter-item">
          <label><input type="checkbox"> Out of stock</label>
          <span>(1)</span>
        </div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="collection-content">
      <div class="collection-toolbar">
        <div class="breadcrumb">
          <a href="index.html">Home</a> / <span>{breadcrumb_title}</span>
        </div>
        <div class="sort-by">
          Sort by: 
          <select>
            <option>Best selling</option>
            <option>Featured</option>
            <option>Alphabetically, A-Z</option>
            <option>Price, low to high</option>
            <option>Price, high to low</option>
            <option>Date, old to new</option>
            <option>Date, new to old</option>
          </select>
        </div>
      </div>

      <div class="collection-grid">
{cards_html}
      </div>
    </div>
  </section>
"""
        page_html = header + main_content + footer
        with open(filename, 'w', encoding='utf-8') as pf:
            pf.write(page_html)
        print(f"Created {filename}")

    create_page("CROSS TRAINER", "cross-trainer.html")
    create_page("GYM EQUIPMENT", "gym-equipment.html")
    create_page("PROTEIN POWDER", "protein-powder.html")
    create_page("TREADMILLS", "treadmills.html")

    # Append CSS
    css_content = """

/* ================================
   COLLECTION PAGE SPECIFIC STYLES
================================ */
.collection-header-section {
  background: #000;
  color: #fff;
  padding: 60px 40px 80px;
}
.collection-header-section .back-link {
  display: inline-flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 40px;
  transition: all 0.3s;
}
.collection-header-section .back-link .icon-circle {
  border: 1px solid #555;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  transition: all 0.3s;
}
.collection-header-section .back-link:hover {
  color: #ccff00;
}
.collection-header-section .back-link:hover .icon-circle {
  border-color: #ccff00;
  color: #ccff00;
}
.collection-header-section h1 {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 20px;
  text-transform: uppercase;
}
.collection-header-section h1 span {
  font-size: 18px;
  font-weight: 400;
  color: #aaa;
  vertical-align: middle;
}
.collection-header-section p {
  color: #ccc;
  max-width: 650px;
  line-height: 1.6;
  font-size: 15px;
}

.collection-main-layout {
  display: flex;
  padding: 60px 40px;
  max-width: 1400px;
  margin: 0 auto;
  gap: 40px;
}

.collection-sidebar {
  width: 250px;
  flex-shrink: 0;
}
.collection-sidebar .sidebar-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.collection-sidebar .filter-group-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  letter-spacing: 1px;
}
.collection-sidebar .filter-reset {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
}
.collection-sidebar .filter-reset a {
  color: #000;
  text-decoration: none;
}
.collection-sidebar .filter-reset a:hover {
  text-decoration: underline;
}
.collection-sidebar .filter-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #333;
  align-items: center;
}
.collection-sidebar .filter-item label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.collection-sidebar .filter-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #ccff00;
}

.collection-content {
  flex-grow: 1;
}
.collection-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.collection-toolbar .breadcrumb {
  font-size: 14px;
  color: #000;
  font-weight: 500;
}
.collection-toolbar .breadcrumb a {
  color: #000;
  text-decoration: none;
}
.collection-toolbar .breadcrumb a:hover {
  text-decoration: underline;
}
.collection-toolbar .breadcrumb span {
  color: #888;
}
.collection-toolbar .sort-by {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.collection-toolbar .sort-by select {
  padding: 8px 30px 8px 15px;
  border: 1px solid #ddd;
  border-radius: 0;
  outline: none;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

/* Fix b-card in grid */
.collection-grid .b-card {
  width: 100% !important;
  margin: 0 !important;
  min-width: 0;
  border: 1px solid #f5f5f5;
}

@media (max-width: 1200px) {
  .collection-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 991px) {
  .collection-main-layout {
    flex-direction: column;
    padding: 40px 20px;
  }
  .collection-sidebar {
    width: 100%;
  }
  .collection-sidebar .sidebar-title {
    margin-bottom: 20px;
  }
}
@media (max-width: 576px) {
  .collection-grid {
    grid-template-columns: 1fr;
  }
  .collection-header-section {
    padding: 40px 20px;
  }
  .collection-header-section h1 {
    font-size: 30px;
  }
}
"""
    with open('index.css', 'a', encoding='utf-8') as f:
        f.write(css_content)
    print("Appended CSS to index.css")

if __name__ == "__main__":
    main()
