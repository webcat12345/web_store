<?php
if (isset($this->session->userdata['logged_in'])){
    $username = ($this->session->userdata['logged_in']['username']);
    $email = ($this->session->userdata['logged_in']['email']);
}   else    {
    header("location : login");
}
?>

<div id = "sidebar_container">
    <?php
    for ($i = 0; $i < $article_count; $i++){
        echo "<img class = 'paperclip' alt = 'paperclip' src = '".base_url()."/application/css/paperclip.png'>";
        echo "<div class = 'sidebar'>";
        echo "<h3>" .$article_info[$i]->subject."</h3>";
        echo "<h4> Written by " .$article_info[$i]->user_name."..........</h4>";
        echo "<h5> Published date " .$article_info[$i]->date."</h5>";
        echo "<p> Published date " .$article_info[$i]->content."</p>";
        echo "</div>";
    }
    ?>
</div>
<div id = "content">
    <h1>Welcome to my first dashboard</h1>
    <p>This standards compliant, simple, fixed width website template is released as an 'open source' design (under a <a href="http://creativecommons.org/licenses/by/3.0">Creative Commons Attribution 3.0 Licence</a>), which means that you are free to download and use it for anything you want (including modifying and amending it). All I ask is that you leave the 'design from HTML5webtemplates.co.uk' link in the footer of the template, but other than that...</p>
    <p>This template is written entirely in <strong>HTML5</strong> and <strong>CSS</strong>, and can be validated using the links in the footer.</p>
    <?php echo form_open('show_article/add_new')?>
    <div id = "btn_section">
        <input type = "submit" value = "Add new Article" name = "newarticle"/><br/>
    </div>
    <?php form_close()?>
</div>
