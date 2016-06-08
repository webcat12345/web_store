<?php
if (isset($this->session->userdata['logged_in'])){
    $username = ($this->session->userdata['logged_in']['username']);
    $email = ($this->session->userdata['logged_in']['email']);
}   else    {
    header("location : login");
}
?>

<div id="content">
    <h1>New Article</h1>
    <p>Make your own news</p>
    <p>Your email address is <?php echo $email?></p>
    <?php echo date("Y-m-d");?>
    <?php echo form_open('show_article/submit_new_article')?>
    <div class = "form_settings">
        <p><span>Name</span>
            <input class="contact" type="text" name="username" value="<?php echo $username ?>" />
        </p>
        <p><span>Subject</span>
            <input class="contact" type="text" name="subject" value="" />
        </p>
        <p><span>Content</span>
            <textarea class="contact textarea" rows="8" cols="50" name="content"></textarea>
        </p>
        <p style="padding-top: 15px"><span>&nbsp;</span>
            <input class="submit" type="submit" name="contact_submitted" value="Add this article" />
        </p>

    </div>
    <?php form_close()?>
</div>