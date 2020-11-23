<?php ?>
<section class="ht7-chat-base" id="">
    <header class="clearfix">
        <?php include __DIR__ . '/header.php'; ?>
    </header>
    <main class="clearfix">
        <div class="row">
            <div class="col-xs-12 col-sm-9">
                <?php include __DIR__ . '/output.php'; ?>
            </div>
            <div class="col-xs-12 col-sm-3">
                <?php include __DIR__ . '/members.php'; ?>
            </div>
        </div>
    </main>
    <footer class="clearfix">
        <?php include __DIR__ . '/input.php'; ?>
    </footer>
    <?php include __DIR__ . '/templates.php'; ?>
</section>